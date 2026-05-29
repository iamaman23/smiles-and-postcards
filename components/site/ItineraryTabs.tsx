"use client";

import type { BlogDay } from "../../lib/site-content";

function getItineraryDayNumber(day: BlogDay, index: number) {
  const match = String(day?.day ?? "").match(/\d+/);
  return match ? match[0] : String(index + 1);
}

function getDisplaySpots(day: BlogDay): Array<{ key: string; label: string }> {
  if (day.spotDetails?.length) {
    return day.spotDetails.map((spot, index) => ({
      key: spot.id || `${day.day}-${spot.name}-${index}`,
      label: spot.name
    }));
  }

  return day.spots.map((spot, index) => ({
    key: `${day.day}-${spot}-${index}`,
    label: spot
  }));
}

export function ItineraryTabs({
  activeIndex,
  itinerary,
  onActiveIndexChange,
  storyId
}: {
  activeIndex: number;
  itinerary: BlogDay[];
  onActiveIndexChange: (index: number) => void;
  storyId: string;
}) {
  return (
    <div className="itinerary-tabs" data-itinerary-tabs>
      <div className="itinerary-tabs__nav" role="tablist" aria-label="Itinerary Days">
        {itinerary.map((day, index) => {
          const isActive = index === activeIndex;
          const dayNumber = getItineraryDayNumber(day, index);
          return (
            <button
              className={`itinerary-tabs__tab ${isActive ? "active" : ""}`}
              id={`${storyId}-itinerary-tab-${index}`}
              type="button"
              role="tab"
              aria-controls={`${storyId}-itinerary-panel-${index}`}
              aria-selected={isActive}
              aria-label={`Show itinerary day ${dayNumber}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onActiveIndexChange(index)}
              key={`${storyId}-${day.day}-${index}`}
            >
              {dayNumber}
            </button>
          );
        })}
      </div>

      {itinerary.map((day, index) => {
        const isActive = index === activeIndex;
        const dayNumber = getItineraryDayNumber(day, index);
        return (
          <div
            className={`itinerary-tabs__panel ${isActive ? "active" : ""}`}
            id={`${storyId}-itinerary-panel-${index}`}
            data-itinerary-panel={index}
            role="tabpanel"
            aria-labelledby={`${storyId}-itinerary-tab-${index}`}
            key={`${storyId}-${day.day}-${day.title}-${index}`}
          >
            <div className="itinerary-tabs__panel-head">
              <span className="itinerary-tabs__day">{dayNumber}</span>
              <h3 className="itinerary-tabs__title">{day.title}</h3>
            </div>
            <p className="itinerary-tabs__text">{day.text}</p>
            {getDisplaySpots(day).length ? (
              <div className="itinerary-tabs__location" aria-label="Destinations for this day">
                {getDisplaySpots(day).map((spot) => (
                  <span className="itinerary-tabs__location-pill" key={spot.key}>
                    {spot.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
