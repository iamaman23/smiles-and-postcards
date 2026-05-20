"use client";

import { useState } from "react";
import type { BlogDay } from "../../lib/site-content";

function getItineraryDayNumber(day: BlogDay, index: number) {
  const match = String(day?.day ?? "").match(/\d+/);
  return match ? match[0] : String(index + 1);
}

export function ItineraryTabs({ itinerary, storyId }: { itinerary: BlogDay[]; storyId: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

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
              onClick={() => setActiveIndex(index)}
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
            {day.spots.length ? (
              <div className="itinerary-tabs__spots">
                {day.spots.map((spot) => (
                  <span className="spot-tag" key={`${day.day}-${spot}`}>{spot}</span>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
