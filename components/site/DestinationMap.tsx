"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { PlaceEntity } from "../../lib/site-content";
import { DEFAULT_MAP_VIEW, MAP_VIEWS, type MapViewId } from "../../lib/map-config";

type MapVariant = "itinerary" | "food" | "gem" | "combined";

type DestinationMapProps = {
  title: string;
  eyebrow?: string;
  metaLabel?: string;
  emptyLabel?: string;
  overlayLabel?: string;
  destinationLabel?: string;
  fallbackSpots?: PlaceEntity[];
  spots: PlaceEntity[];
  variant?: MapVariant;
};

type MarkerDefinition = {
  icon: string;
  label: string;
};

const DEFAULT_CENTER: [number, number] = [13.388, 52.517];
const MAP_PADDING = 68;
const POPUP_VIEWPORT_PADDING = 20;
const POPUP_MIN_HEIGHT = 160;
const SINGLE_SPOT_ZOOM = 15;
const FIT_BOUNDS_MAX_ZOOM = 15;
const MAX_SOURCE_ZOOM = 19;
const MAX_INTERACTIVE_ZOOM = Math.min(MAX_SOURCE_ZOOM - 1, 17);
const MIN_INTERACTIVE_ZOOM = 2;
const FALLBACK_DESCRIPTION = "A stop worth adding to the day, with the exact mood and details ready to fill in from the itinerary editor.";

const MARKER_BY_VARIANT: Record<MapVariant, MarkerDefinition> = {
  itinerary: { icon: "•", label: "Stop" },
  food: { icon: "🍽", label: "Food" },
  gem: { icon: "✦", label: "Detour" },
  combined: { icon: "⌘", label: "Stop" }
};

function hasCoordinates(place: PlaceEntity) {
  return Boolean(place.geo && Number.isFinite(place.geo.lat) && Number.isFinite(place.geo.lng));
}

function getPlaceVariant(place: PlaceEntity, fallbackVariant: MapVariant): MapVariant {
  const kind = String(place.kind || "").toLowerCase();
  if (kind === "food") return "food";
  if (kind === "gem") return "gem";
  if (kind === "itinerary") return "itinerary";
  return fallbackVariant;
}

function getMarkerDefinition(place: PlaceEntity, fallbackVariant: MapVariant) {
  return MARKER_BY_VARIANT[getPlaceVariant(place, fallbackVariant)];
}

function getBounds(maplibre: Awaited<typeof import("maplibre-gl")>, spots: PlaceEntity[]) {
  const bounds = new maplibre.LngLatBounds();
  spots.forEach((spot) => {
    if (!spot.geo) return;
    bounds.extend([spot.geo.lng, spot.geo.lat]);
  });
  return bounds;
}

function getGoogleMapsPlaceUrl(spot: PlaceEntity, destinationLabel?: string) {
  const query = [spot.name, spot.address, destinationLabel].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function buildPopupCard(spot: PlaceEntity, onClose: () => void, destinationLabel?: string) {
  const card = document.createElement("article");
  card.className = "destination-map-card";

  const redirectLink = document.createElement("a");
  redirectLink.href = getGoogleMapsPlaceUrl(spot, destinationLabel);
  redirectLink.target = "_blank";
  redirectLink.rel = "noreferrer";
  redirectLink.className = "destination-map-card__redirect";
  redirectLink.setAttribute("aria-label", `Open ${spot.name} in Google Maps`);
  redirectLink.setAttribute("title", `Open ${spot.name} in Google Maps`);
  redirectLink.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11Z"></path>
      <circle cx="12" cy="10" r="2.5"></circle>
    </svg>
  `;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "destination-map-card__close";
  closeButton.setAttribute("aria-label", `Close details for ${spot.name}`);
  closeButton.innerHTML = "&times;";
  closeButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClose();
  });

  const title = document.createElement("h4");
  title.className = "destination-map-card__title";
  title.textContent = spot.name;

  const description = document.createElement("p");
  description.className = "destination-map-card__description";
  description.textContent = spot.desc?.trim() || FALLBACK_DESCRIPTION;

  card.append(redirectLink, closeButton, title);

  if (spot.address?.trim()) {
    const address = document.createElement("p");
    address.className = "destination-map-card__address";
    address.textContent = spot.address.trim();
    card.append(address);
  }

  card.append(description);

  if (spot.cuisine?.trim() || spot.price?.trim()) {
    const meta = document.createElement("div");
    meta.className = "destination-map-card__chips";

    if (spot.cuisine?.trim()) {
      const cuisine = document.createElement("span");
      cuisine.className = "destination-map-card__chip";
      cuisine.textContent = spot.cuisine.trim();
      meta.append(cuisine);
    }

    if (spot.price?.trim()) {
      const price = document.createElement("span");
      price.className = "destination-map-card__chip";
      price.textContent = spot.price.trim();
      meta.append(price);
    }

    card.append(meta);
  }

  return card;
}

function clampMapZoom(map: any) {
  if (!map) return;
  const zoom = map.getZoom();
  if (!Number.isFinite(zoom)) {
    map.setZoom(Math.min(SINGLE_SPOT_ZOOM, MAX_INTERACTIVE_ZOOM));
    return;
  }
  if (zoom > MAX_INTERACTIVE_ZOOM) {
    map.setZoom(MAX_INTERACTIVE_ZOOM);
  }
  if (zoom < MIN_INTERACTIVE_ZOOM) {
    map.setZoom(MIN_INTERACTIVE_ZOOM);
  }
}

function keepPopupInView(map: any, popup: any, lngLat: [number, number], animate = true) {
  const container = map?.getContainer?.() as HTMLElement | null;
  const popupElement = popup?.getElement?.() as HTMLElement | null;
  if (!container || !popupElement) return;

  const popupContent = popupElement.querySelector(".maplibregl-popup-content") as HTMLElement | null;
  if (popupContent) {
    const maxHeight = Math.max(container.clientHeight - POPUP_VIEWPORT_PADDING * 2, POPUP_MIN_HEIGHT);
    popupContent.style.maxHeight = `${maxHeight}px`;
    popupContent.style.overflowY = "auto";
  }

  const containerRect = container.getBoundingClientRect();
  const popupRect = popupElement.getBoundingClientRect();
  const minLeft = containerRect.left + POPUP_VIEWPORT_PADDING;
  const maxRight = containerRect.right - POPUP_VIEWPORT_PADDING;
  const minTop = containerRect.top + POPUP_VIEWPORT_PADDING;
  const maxBottom = containerRect.bottom - POPUP_VIEWPORT_PADDING;

  let shiftX = 0;
  let shiftY = 0;

  if (popupRect.left < minLeft) shiftX = minLeft - popupRect.left;
  else if (popupRect.right > maxRight) shiftX = maxRight - popupRect.right;

  if (popupRect.top < minTop) shiftY = minTop - popupRect.top;
  else if (popupRect.bottom > maxBottom) shiftY = maxBottom - popupRect.bottom;

  if (!shiftX && !shiftY) return;

  const currentCenterPoint = map.project(map.getCenter());
  const nextCenter = map.unproject([
    currentCenterPoint.x - shiftX,
    currentCenterPoint.y - shiftY
  ]);

  map.easeTo({
    center: nextCenter,
    duration: animate ? 300 : 0
  });

  window.requestAnimationFrame(() => {
    popup.setLngLat(lngLat);
  });
}

export function DestinationMap({
  title,
  eyebrow = "Map",
  metaLabel,
  emptyLabel,
  overlayLabel,
  destinationLabel,
  fallbackSpots = [],
  spots,
  variant = "itinerary"
}: DestinationMapProps) {
  const mapId = useId();
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const maplibreRef = useRef<Awaited<typeof import("maplibre-gl")> | null>(null);
  const markerRefs = useRef<Array<{ element: HTMLButtonElement; marker: any; name: string }>>([]);
  const popupRef = useRef<any>(null);
  const readyRef = useRef(false);
  const activeSpotNameRef = useRef<string | null>(null);
  const visibleSpotsRef = useRef<PlaceEntity[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [activeSpotName, setActiveSpotName] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<MapViewId>(DEFAULT_MAP_VIEW);

  const initialSpots = useMemo(
    () => (spots.length ? spots : fallbackSpots).filter(hasCoordinates),
    [fallbackSpots, spots]
  );
  const visibleSpots = useMemo(() => spots.filter(hasCoordinates), [spots]);
  const hasAnyMappedSpots = initialSpots.length > 0;
  const hasVisibleSpots = visibleSpots.length > 0;

  useEffect(() => {
    setActiveSpotName(null);
  }, [visibleSpots]);

  useEffect(() => {
    activeSpotNameRef.current = activeSpotName;
  }, [activeSpotName]);

  useEffect(() => {
    visibleSpotsRef.current = visibleSpots;
  }, [visibleSpots]);

  useEffect(() => {
    if (!mapNodeRef.current || !hasAnyMappedSpots || mapRef.current) return;

    let disposed = false;

    async function setup() {
      const maplibre = await import("maplibre-gl");
      if (disposed || !mapNodeRef.current) return;
      maplibreRef.current = maplibre;

      const firstSpot = initialSpots[0];
      const center = firstSpot?.geo ? ([firstSpot.geo.lng, firstSpot.geo.lat] as [number, number]) : DEFAULT_CENTER;

      const map = new maplibre.Map({
        attributionControl: {},
        center,
        container: mapNodeRef.current,
        dragRotate: false,
        maxZoom: MAX_INTERACTIVE_ZOOM,
        minZoom: MIN_INTERACTIVE_ZOOM,
        pitchWithRotate: false,
        scrollZoom: true,
        style: MAP_VIEWS[activeView].style,
        touchPitch: false,
        zoom: firstSpot?.geo ? 12 : 3
      });

      mapRef.current = map;
      popupRef.current = new maplibre.Popup({
        anchor: "bottom",
        closeButton: false,
        closeOnClick: false,
        maxWidth: "290px",
        offset: 18
      });

      map.addControl(new maplibre.NavigationControl({ showCompass: false, visualizePitch: false }), "top-right");
      map.touchZoomRotate.enable();
      map.scrollZoom.enable();
      map.on("click", () => {
        setActiveSpotName(null);
      });
      map.on("zoomend", () => {
        clampMapZoom(map);
      });
      map.on("moveend", () => {
        clampMapZoom(map);
      });
      map.on("styleimagemissing", () => {
        clampMapZoom(map);
      });
      popupRef.current.on("close", () => {
        setActiveSpotName(null);
      });
      popupRef.current.on("open", () => {
        const currentPopup = popupRef.current;
        const currentSpot = visibleSpotsRef.current.find((spot) => spot.name === activeSpotNameRef.current);
        if (!currentPopup || !currentSpot?.geo) return;
        window.requestAnimationFrame(() => {
          keepPopupInView(map, currentPopup, [currentSpot.geo!.lng, currentSpot.geo!.lat]);
        });
      });

      map.once("load", () => {
        if (disposed) return;
        clampMapZoom(map);
        map.resize();
        readyRef.current = true;
        setIsMapReady(true);
      });
    }

    void setup();

    return () => {
      disposed = true;
      readyRef.current = false;
      setIsMapReady(false);
      popupRef.current?.remove();
      markerRefs.current.forEach(({ marker }) => marker.remove());
      markerRefs.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      maplibreRef.current = null;
    };
  }, [hasAnyMappedSpots]);

  useEffect(() => {
    if (!mapRef.current || !readyRef.current) return;
    const map = mapRef.current;
    map.setMaxZoom(MAX_INTERACTIVE_ZOOM);
    map.setMinZoom(MIN_INTERACTIVE_ZOOM);
    map.setStyle(MAP_VIEWS[activeView].style);
    map.once("styledata", () => {
      map.setMaxZoom(MAX_INTERACTIVE_ZOOM);
      map.setMinZoom(MIN_INTERACTIVE_ZOOM);
      clampMapZoom(map);
      map.resize();
    });
  }, [activeView]);

  useEffect(() => {
    if (!mapRef.current || !maplibreRef.current || !readyRef.current || !isMapReady) return;
    const map = mapRef.current;
    const maplibre = maplibreRef.current;
    map.resize();

    markerRefs.current.forEach(({ marker }) => marker.remove());
    markerRefs.current = [];

    visibleSpots.forEach((spot, index) => {
      if (!spot.geo) return;

      const markerMeta = getMarkerDefinition(spot, variant);
      const element = document.createElement("button");
      element.type = "button";
      element.className = `destination-map__marker destination-map__marker--${getPlaceVariant(spot, variant)}`;
      element.setAttribute("aria-label", `Show ${spot.name} on the map`);
      element.innerHTML = `
        <span class="destination-map__marker-core">
          <span class="destination-map__marker-icon">${markerMeta.icon}</span>
        </span>
        <span class="destination-map__marker-index">${String(index + 1).padStart(2, "0")}</span>
      `;
      const markerInstance = new maplibre.Marker({ element, anchor: "bottom" });

      markerInstance.setLngLat([spot.geo.lng, spot.geo.lat]).addTo(map);

      element.addEventListener("click", (event) => {
        event.stopPropagation();
        setActiveSpotName(spot.name);
      });
      element.addEventListener("mousedown", (event) => {
        event.stopPropagation();
      });
      element.addEventListener("touchstart", (event) => {
        event.stopPropagation();
      });

      markerRefs.current.push({ element, marker: markerInstance, name: spot.name });
    });

    if (visibleSpots.length > 1) {
      map.fitBounds(getBounds(maplibre, visibleSpots), {
        animate: true,
        duration: 800,
        maxZoom: FIT_BOUNDS_MAX_ZOOM,
        padding: MAP_PADDING
      });
    } else if (visibleSpots[0]?.geo) {
      map.easeTo({
        center: [visibleSpots[0].geo.lng, visibleSpots[0].geo.lat],
        duration: 800,
        zoom: SINGLE_SPOT_ZOOM
      });
    }

    window.setTimeout(() => clampMapZoom(map), 0);
  }, [isMapReady, variant, visibleSpots]);

  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const handleResize = () => {
      mapRef.current?.resize();
      clampMapZoom(mapRef.current);
      const activeSpot = visibleSpots.find((spot) => spot.name === activeSpotName);
      if (activeSpot?.geo && popupRef.current?.isOpen?.()) {
        window.requestAnimationFrame(() => {
          keepPopupInView(
            mapRef.current,
            popupRef.current,
            [activeSpot.geo!.lng, activeSpot.geo!.lat],
            false
          );
        });
      }
    };

    window.addEventListener("resize", handleResize);
    const frame = window.requestAnimationFrame(handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frame);
    };
  }, [activeSpotName, isMapReady, visibleSpots]);

  useEffect(() => {
    if (!mapRef.current) return;
    markerRefs.current.forEach(({ element, name }) => {
      element.classList.toggle("is-active", name === activeSpotName);
    });

    if (!activeSpotName) {
      popupRef.current?.remove();
      return;
    }

    const activeSpot = visibleSpots.find((spot) => spot.name === activeSpotName);
    if (!activeSpot?.geo) {
      popupRef.current?.remove();
      return;
    }

    popupRef.current
      ?.setLngLat([activeSpot.geo.lng, activeSpot.geo.lat])
      .setDOMContent(buildPopupCard(activeSpot, () => setActiveSpotName(null), destinationLabel))
      .addTo(mapRef.current);
  }, [activeSpotName, destinationLabel, isMapReady, visibleSpots]);

  if (!hasAnyMappedSpots) {
    return (
      <div className="destination-map destination-map--empty" aria-live="polite">
        <div className="destination-map__empty">
          <p className="destination-map__eyebrow">{eyebrow}</p>
          <h3>{emptyLabel || "Mapped spots coming soon"}</h3>
          <p>This section will appear as soon as coordinates are added for these places.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`destination-map destination-map--${variant}`}>
      <div className="destination-map__header">
        <div>
          <p className="destination-map__eyebrow">{eyebrow}</p>
          <h3 className="destination-map__title">{title}</h3>
        </div>
        <div className="destination-map__header-meta">
          <div className="destination-map__view-toggle" role="tablist" aria-label="Map view">
            {(Object.keys(MAP_VIEWS) as MapViewId[]).map((viewId) => {
              const view = MAP_VIEWS[viewId];
              const isActive = activeView === viewId;
              return (
                <button
                  key={viewId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`destination-map__view-pill${isActive ? " is-active" : ""}`}
                  onClick={() => setActiveView(viewId)}
                >
                  {view.label}
                </button>
              );
            })}
          </div>
          {metaLabel ? <p className="destination-map__meta">{metaLabel}</p> : null}
        </div>
      </div>
      <div className="destination-map__frame">
        <div ref={mapNodeRef} id={mapId} className="destination-map__canvas" />
        {!hasVisibleSpots ? (
          <div className="destination-map__overlay" aria-live="polite">
            <p>{overlayLabel || "These places do not have map coordinates yet."}</p>
          </div>
        ) : null}
      </div>
      <p className="destination-map__hint">
        {variant === "combined"
          ? "Food, detours, and itinerary stops share the same view. Each pin style marks a different type."
          : "Pins use section-specific styling so the map reads quickly at a glance."}
      </p>
    </div>
  );
}
