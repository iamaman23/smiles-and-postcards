"use client";

import { useMemo, useState } from "react";
import type { BlogDay, PlaceEntity } from "../../lib/site-content";
import { DestinationMap } from "./DestinationMap";
import { ItineraryTabs } from "./ItineraryTabs";

function getDayNumber(day: BlogDay, index: number) {
  const match = String(day?.day ?? "").match(/\d+/);
  return match ? match[0] : String(index + 1);
}

function hasCoordinates(place: PlaceEntity) {
  return Boolean(place.geo && Number.isFinite(place.geo.lat) && Number.isFinite(place.geo.lng));
}

function getMappedSpots(day: BlogDay | undefined) {
  return (day?.spotDetails || []).filter(hasCoordinates);
}

export function ItineraryExperience({
  itinerary,
  storyId
}: {
  itinerary: BlogDay[];
  storyId: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDay = itinerary[activeIndex];

  const visibleSpots = useMemo(() => getMappedSpots(activeDay), [activeDay]);
  const fallbackSpots = useMemo(() => {
    for (const day of itinerary) {
      const mapped = getMappedSpots(day);
      if (mapped.length) return mapped;
    }
    return [];
  }, [itinerary]);

  return (
    <div className="itinerary-experience">
      <div className="itinerary-experience__tabs">
        <ItineraryTabs
          activeIndex={activeIndex}
          itinerary={itinerary}
          onActiveIndexChange={setActiveIndex}
          storyId={storyId}
        />
      </div>
      <DestinationMap
        dayLabel={`Day ${getDayNumber(activeDay, activeIndex)}`}
        fallbackSpots={fallbackSpots}
        spots={visibleSpots}
      />
    </div>
  );
}
