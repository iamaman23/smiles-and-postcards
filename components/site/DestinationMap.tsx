"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { PlaceEntity } from "../../lib/site-content";
import { DEFAULT_MAP_VIEW, MAP_VIEWS, type MapViewId } from "../../lib/map-config";

type DestinationMapProps = {
  dayLabel: string;
  fallbackSpots: PlaceEntity[];
  spots: PlaceEntity[];
};

const DEFAULT_CENTER: [number, number] = [13.388, 52.517];
const MAP_PADDING = 68;
const MAX_INTERACTIVE_ZOOM = 19;
const FALLBACK_DESCRIPTION = "A stop worth adding to the day, with the exact mood and details ready to fill in from the itinerary editor.";

function hasCoordinates(place: PlaceEntity) {
  return Boolean(place.geo && Number.isFinite(place.geo.lat) && Number.isFinite(place.geo.lng));
}

function getBounds(maplibre: Awaited<typeof import("maplibre-gl")>, spots: PlaceEntity[]) {
  const bounds = new maplibre.LngLatBounds();
  spots.forEach((spot) => {
    if (!spot.geo) return;
    bounds.extend([spot.geo.lng, spot.geo.lat]);
  });
  return bounds;
}

function buildPopupCard(spot: PlaceEntity, dayLabel: string, onClose: () => void) {
  const card = document.createElement("article");
  card.className = "destination-map-card";

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

  const eyebrow = document.createElement("p");
  eyebrow.className = "destination-map-card__eyebrow";
  eyebrow.textContent = dayLabel;

  const title = document.createElement("h4");
  title.className = "destination-map-card__title";
  title.textContent = spot.name;

  const description = document.createElement("p");
  description.className = "destination-map-card__description";
  description.textContent = spot.desc?.trim() || FALLBACK_DESCRIPTION;

  card.append(closeButton, eyebrow, title, description);
  return card;
}

export function DestinationMap({
  dayLabel,
  fallbackSpots,
  spots
}: DestinationMapProps) {
  const mapId = useId();
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const maplibreRef = useRef<Awaited<typeof import("maplibre-gl")> | null>(null);
  const markerRefs = useRef<Array<{ element: HTMLButtonElement; marker: any; name: string }>>([]);
  const popupRef = useRef<any>(null);
  const readyRef = useRef(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [activeSpotName, setActiveSpotName] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<MapViewId>(DEFAULT_MAP_VIEW);

  const initialSpots = useMemo(() => (spots.length ? spots : fallbackSpots).filter(hasCoordinates), [fallbackSpots, spots]);
  const visibleSpots = useMemo(() => spots.filter(hasCoordinates), [spots]);
  const hasAnyMappedSpots = initialSpots.length > 0;
  const hasVisibleSpots = visibleSpots.length > 0;

  useEffect(() => {
    setActiveSpotName(null);
  }, [visibleSpots]);

  useEffect(() => {
    if (!mapNodeRef.current || !hasAnyMappedSpots || mapRef.current) return;

    let disposed = false;

    async function setup() {
      const maplibre = await import("maplibre-gl");
      if (disposed || !mapNodeRef.current) return;
      maplibreRef.current = maplibre;

      const firstSpot = initialSpots[0];
      const center = firstSpot?.geo ? [firstSpot.geo.lng, firstSpot.geo.lat] as [number, number] : DEFAULT_CENTER;

      const map = new maplibre.Map({
        attributionControl: {},
        center,
        container: mapNodeRef.current,
        dragRotate: false,
        maxZoom: MAX_INTERACTIVE_ZOOM,
        pitchWithRotate: false,
        scrollZoom: true,
        style: MAP_VIEWS[activeView].style,
        touchPitch: false,
        zoom: firstSpot?.geo ? 12 : 3
      });

      mapRef.current = map;
      popupRef.current = new maplibre.Popup({
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
      popupRef.current.on("close", () => {
        setActiveSpotName(null);
      });

      map.once("load", () => {
        if (disposed) return;
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
  }, [activeView, hasAnyMappedSpots]);

  useEffect(() => {
    if (!mapRef.current || !readyRef.current) return;
    mapRef.current.setMaxZoom(MAX_INTERACTIVE_ZOOM);
    mapRef.current.setStyle(MAP_VIEWS[activeView].style);
    mapRef.current.once("styledata", () => {
      mapRef.current?.setMaxZoom(MAX_INTERACTIVE_ZOOM);
      mapRef.current?.resize();
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

      const element = document.createElement("button");
      element.type = "button";
      element.className = "destination-map__marker";
      element.setAttribute("aria-label", `Show ${spot.name} on the map`);
      element.innerHTML = `
        <span class="destination-map__marker-core"></span>
        <span class="destination-map__marker-index">${String(index + 1).padStart(2, "0")}</span>
      `;
      const markerInstance = new maplibre.Marker({ element, anchor: "bottom" });

      markerInstance
        .setLngLat([spot.geo.lng, spot.geo.lat])
        .addTo(map);

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
        maxZoom: 14,
        padding: MAP_PADDING
      });
    } else if (visibleSpots[0]?.geo) {
      map.easeTo({
        center: [visibleSpots[0].geo.lng, visibleSpots[0].geo.lat],
        duration: 800,
        zoom: 13
      });
    }
  }, [isMapReady, visibleSpots]);

  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const handleResize = () => {
      mapRef.current?.resize();
    };

    window.addEventListener("resize", handleResize);
    const frame = window.requestAnimationFrame(handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frame);
    };
  }, [isMapReady]);

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
      .setDOMContent(buildPopupCard(activeSpot, dayLabel, () => setActiveSpotName(null)))
      .addTo(mapRef.current);
  }, [activeSpotName, dayLabel, visibleSpots]);

  if (!hasAnyMappedSpots) {
    return (
      <div className="destination-map destination-map--empty" aria-live="polite">
        <div className="destination-map__empty">
          <p className="destination-map__eyebrow">Itinerary map</p>
          <h3>Mapped stops coming soon</h3>
          <p>This destination already supports itinerary tabs. The interactive map will appear as soon as stop coordinates are added.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="destination-map">
      <div className="destination-map__header">
        <div>
          <p className="destination-map__eyebrow">Itinerary map</p>
          <h3 className="destination-map__title">{dayLabel}</h3>
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
          <p className="destination-map__meta">
            {hasVisibleSpots ? `${visibleSpots.length} mapped stop${visibleSpots.length === 1 ? "" : "s"}` : "No mapped stops for this day"}
          </p>
        </div>
      </div>
      <div className="destination-map__frame">
        <div ref={mapNodeRef} id={mapId} className="destination-map__canvas" />
        {!hasVisibleSpots ? (
          <div className="destination-map__overlay" aria-live="polite">
            <p>This day has no mapped coordinates yet. Choose another day or add coordinates in the admin.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
