import type { CSSProperties } from "react";
import Link from "next/link";
import { DestinationMap } from "./DestinationMap";
import { ItineraryExperience } from "./ItineraryExperience";
import { SiteFooter } from "./SiteFooter";
import {
  getBreakdownScores,
  getBudgetTier,
  getSnapshotSummary,
  type PlaceEntity,
  type TravelBlog
} from "../../lib/site-content";

const FOOD_VENUE_PATTERNS = [
  /\b(?:at|from|inside)\s+([A-Z][\w&'.-]*(?:\s+[A-Z][\w&'.-]*){0,5})/,
  /\b(?:head to|go to|stop by|eat at|book a table at|try)\s+([A-Z][\w&'.-]*(?:\s+[A-Z][\w&'.-]*){0,5})/i
];

const FOOD_DISH_HINTS = /\b(thali|curry|biryani|dumpling|noodle|ramen|soup|sandwich|bratwurst|schnitzel|knipp|taco|pizza|pasta|cake|donut|doughnut|pastry|kebab|falafel|gelato|coffee|tea)\b/i;
const FOOD_PLACE_HINTS = /\b(cafe|café|restaurant|bistro|bar|pub|bakery|brasserie|canteen|diner|dhaba|eatery|food stall|stall|tea house|coffee house|roastery|kitchen|tavern|market|hall|pizzeria|grill|izakaya)\b/i;

function cleanVenueCandidate(value: string) {
  return value
    .replace(/[.,;:!?]+$/, "")
    .replace(/\s+(for|with|serving|known|famous|near|inside)$/i, "")
    .trim();
}

function extractVenueName(description: string) {
  for (const pattern of FOOD_VENUE_PATTERNS) {
    const match = description.match(pattern);
    if (match?.[1]) return cleanVenueCandidate(match[1]);
  }
  return "";
}

function getFoodCardHeading(place: PlaceEntity) {
  const venueFromDescription = extractVenueName(place.desc || "");
  const name = (place.name || "").trim();
  const nameLooksLikeVenue = FOOD_PLACE_HINTS.test(name);
  const nameLooksLikeDish = FOOD_DISH_HINTS.test(name) && !nameLooksLikeVenue;
  return nameLooksLikeDish && venueFromDescription ? venueFromDescription : name;
}

function getFoodCardSubheading(place: PlaceEntity) {
  const cuisine = (place.cuisine || "").trim();
  if (cuisine) return cuisine;
  if (place.desc) return "Local food spot";
  return "";
}

function hasCoordinates(place: PlaceEntity) {
  return Boolean(place.geo && Number.isFinite(place.geo.lat) && Number.isFinite(place.geo.lng));
}

function uniquePlaces(places: PlaceEntity[]) {
  const seen = new Set<string>();
  return places.filter((place) => {
    const key = [place.name, place.geo?.lat, place.geo?.lng, place.kind].join("::");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function StoryPage({ story }: { story: TravelBlog }) {
  const hasNotes = Boolean(story.warnings?.length || story.skipIf?.length);
  const breakdownScores = getBreakdownScores(story);
  const walkabilityScore = breakdownScores.find(([label]) => label === "Walkability")?.[1] ?? 7;
  const destinationLabel = `${story.city}, ${story.country}`;
  const mappedFoodSpots = story.food.filter(hasCoordinates);
  const mappedGems = story.gems.filter(hasCoordinates);
  const mappedItinerarySpots = uniquePlaces(
    story.itinerary.flatMap((day) => (day.spotDetails || []).filter(hasCoordinates))
  );
  const combinedMappedSpots = uniquePlaces([
    ...mappedItinerarySpots,
    ...mappedFoodSpots,
    ...mappedGems
  ]);
  const guideLinks = [
    story.itinerary?.length ? { href: "#section-itinerary", label: "Itinerary" } : null,
    story.food?.length ? { href: "#section-food", label: "Best Food Spots" } : null,
    story.gems?.length ? { href: "#section-gems", label: "Worth a Detour" } : null,
    combinedMappedSpots.length ? { href: "#section-map-overview", label: "Map Overview" } : null,
    story.highlights?.length ? { href: "#section-highlights", label: "Highlights" } : null,
    story.budgetBreakdown?.length ? { href: "#section-budget", label: "Budget Breakdown" } : null,
    hasNotes ? { href: "#section-notes", label: "Warnings and Skip If" } : null
  ].filter((item): item is { href: string; label: string } => Boolean(item));

  return (
    <main>
      <section className="blog-hero">
        <img className="blog-hero__img" src={story.heroImage || story.image} alt={story.city} />
        <div className="blog-hero__overlay"></div>
        <div className="blog-hero__content">
          <Link className="blog-hero__back" href="/">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Stories
          </Link>
          <p className="blog-hero__country">{story.country}</p>
          <h1 className="blog-hero__title">{story.title}</h1>
          <div className="blog-hero__meta">
            <span className="blog-hero__meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {story.days}-day itinerary
            </span>
            <span className="blog-hero__meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              {story.bestSeason}
            </span>
          </div>
        </div>
      </section>

      {story.stats ? (
        <div className="stats-bar">
          <div className="stats-bar__inner">
            <div className="stat">
              <div className="stat__value">{story.stats.days}</div>
              <div className="stat__label">Days</div>
            </div>
            <div className="stat">
              <div className="stat__value">{getBudgetTier(story)}</div>
              <div className="stat__label">Cost Level</div>
            </div>
            <div className="stat">
              <div className="stat__value">{story.stats.bestMonth}</div>
              <div className="stat__label">Best Month</div>
            </div>
            <div className="stat">
              <div className="stat__value">{walkabilityScore}/10</div>
              <div className="stat__label">Walkability</div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="blog-content">
        <div className="blog-main">
          {story.itinerary?.length ? (
            <section className="content-section reveal" id="section-itinerary">
              <div className="content-section__header">
                <div className="content-section__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h2 className="content-section__title">Itinerary</h2>
                  <p className="content-section__subtitle">{story.days} days of carefully planned wandering</p>
                </div>
              </div>
              <ItineraryExperience itinerary={story.itinerary} storyId={story.id} destinationLabel={destinationLabel} />
            </section>
          ) : null}

          {story.food?.length ? (
            <section className="content-section reveal" id="section-food">
              <div className="content-section__header">
                <div className="content-section__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 8h1a4 4 0 010 8h-1" />
                    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                    <line x1="6" y1="1" x2="6" y2="4" />
                    <line x1="10" y1="1" x2="10" y2="4" />
                    <line x1="14" y1="1" x2="14" y2="4" />
                  </svg>
                </div>
                <div>
                  <h2 className="content-section__title">Best Food Spots</h2>
                  <p className="content-section__subtitle">Places that felt reliably worth your time, from one memorable meal to a repeat stop</p>
                </div>
              </div>
              <div className="food-grid">
                {story.food.map((place, index) => (
                  <div className="food-card" key={`${place.name}-${index}`}>
                    <span className="food-card__index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="food-card__body">
                      <h3 className="food-card__name">{getFoodCardHeading(place)}</h3>
                      {getFoodCardSubheading(place) ? <span className="food-card__cuisine">{getFoodCardSubheading(place)}</span> : null}
                      {place.desc ? <p className="food-card__desc">{place.desc}</p> : null}
                      {place.price ? <span className="food-card__price">{place.price}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
              {mappedFoodSpots.length ? (
                <div className="section-map-block">
                  <DestinationMap
                    destinationLabel={destinationLabel}
                    eyebrow="Food map"
                    spots={mappedFoodSpots}
                    title="Best Food Spots"
                    variant="food"
                  />
                </div>
              ) : null}
            </section>
          ) : null}

          {story.gems?.length ? (
            <section className="content-section reveal" id="section-gems">
              <div className="content-section__header">
                <div className="content-section__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div>
                  <h2 className="content-section__title">Worth a Detour</h2>
                  <p className="content-section__subtitle">Stops we&apos;d still make room for, even on a tighter trip</p>
                </div>
              </div>
              <div className="gems-list">
                {story.gems.map((gem, index) => (
                  <div className="gem-card" key={`${gem.name}-${index}`}>
                    <span className="gem-card__number">0{index + 1}</span>
                    <div className="gem-card__content">
                      <h3 className="gem-card__name">{gem.name}</h3>
                      {gem.desc ? <p className="gem-card__desc">{gem.desc}</p> : null}
                      {gem.tip ? (
                        <div className="gem-card__tip">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          {gem.tip}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              {mappedGems.length ? (
                <div className="section-map-block">
                  <DestinationMap
                    destinationLabel={destinationLabel}
                    eyebrow="Detour map"
                    spots={mappedGems}
                    title="Worth a Detour"
                    variant="gem"
                  />
                </div>
              ) : null}
            </section>
          ) : null}

          {story.highlights?.length ? (
            <section className="content-section reveal" id="section-highlights">
              <div className="content-section__header">
                <div className="content-section__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 3l2.8 5.68L21 9.6l-4.5 4.39 1.06 6.21L12 17.25 6.44 20.2 7.5 13.99 3 9.6l6.2-.92L12 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="content-section__title">Highlights</h2>
                  <p className="content-section__subtitle">Big moments worth building the trip around</p>
                </div>
              </div>
              <div className="highlights-list">
                {story.highlights.map((highlight, index) => (
                  <article className="highlight-card" key={`${highlight}-${index}`}>
                    <span className="highlight-card__index">{String(index + 1).padStart(2, "0")}</span>
                    <p className="highlight-card__text">{highlight}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {story.budgetBreakdown?.length ? (
            <section className="content-section reveal" id="section-budget">
              <div className="content-section__header">
                <div className="content-section__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="content-section__title">Budget Breakdown</h2>
                  <p className="content-section__subtitle">Prices per day in dollars</p>
                </div>
              </div>
              <div className="budget-table-wrap">
                <table className="budget-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Budget</th>
                      <th>Mid-Range</th>
                      <th>Luxury</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {story.budgetBreakdown.map((row, index) => (
                      <tr className={index === story.budgetBreakdown!.length - 1 ? "budget-total" : ""} key={`${row.category}-${index}`}>
                        <td className="budget-cat">{row.category}</td>
                        <td className="budget-val">{row.budget}</td>
                        <td className="budget-val">{row.mid}</td>
                        <td className="budget-val">{row.luxury}</td>
                        <td>{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="budget-note">* Budget assumes hostel dorms, local food, walking, and free attractions. Mid-range uses private rooms, sit-down restaurants, and paid sights. Luxury includes boutique hotels and fine dining.</p>
            </section>
          ) : null}

          {hasNotes ? (
            <section className="content-section reveal" id="section-notes">
              <div className="content-section__header">
                <div className="content-section__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <h2 className="content-section__title">Warnings and Skip If</h2>
                  <p className="content-section__subtitle">A first-iteration reality check before you commit</p>
                </div>
              </div>

              {story.warnings?.length ? (
                <details className="collapsible-note" open>
                  <summary>Warnings</summary>
                  <div className="collapsible-note__body">
                    <ul className="collapsible-note__list">
                      {story.warnings.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              ) : null}

              {story.skipIf?.length ? (
                <details className="collapsible-note">
                  <summary>Skip If</summary>
                  <div className="collapsible-note__body">
                    <ul className="collapsible-note__list">
                      {story.skipIf.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              ) : null}
            </section>
          ) : null}

          {combinedMappedSpots.length ? (
            <section className="content-section reveal" id="section-map-overview">
              <div className="content-section__header">
                <div className="content-section__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" />
                    <path d="M9 3v15" />
                    <path d="M15 6v15" />
                  </svg>
                </div>
                <div>
                  <h2 className="content-section__title">Everything on One Map</h2>
                  <p className="content-section__subtitle">A full destination view with itinerary stops, food finds, and worthwhile detours layered together</p>
                </div>
              </div>
              <DestinationMap
                destinationLabel={destinationLabel}
                eyebrow="Full map"
                spots={combinedMappedSpots}
                title={destinationLabel}
                variant="combined"
              />
            </section>
          ) : null}
        </div>

        <aside className="blog-sidebar">
          {guideLinks.length ? (
            <div className="sidebar-card sidebar-card--toc">
              <h4 className="sidebar-card__title">In This Guide</h4>
              <ul className="toc-list">
                {guideLinks.map((item) => (
                  <li key={item.href}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="sidebar-card sidebar-card--snapshot">
            <div className="sidebar-card__title-wrap">
              <h4 className="sidebar-card__title">City Snapshot</h4>
              <div className="score-guide">
                <button
                  className="score-guide__trigger"
                  type="button"
                  aria-label="How city scores are calculated"
                >
                  i
                </button>
                <div className="score-guide__panel" role="tooltip">
                  <strong>How to read these scores</strong>
                  <p>These are editorial 10-point signals, not hard data guarantees. They blend on-the-ground feel, traveler practicality, and how consistently the destination delivers.</p>
                  <ul className="score-guide__list">
                    <li><strong>Walkability:</strong> How easy it is to cover the city on foot, with useful transit as backup.</li>
                    <li><strong>Food:</strong> Variety, quality, and how reliably memorable the eating scene feels.</li>
                    <li><strong>Safety:</strong> How comfortable most travelers should feel using normal city awareness.</li>
                    <li><strong>Affordability:</strong> How far a typical daily budget tends to stretch.</li>
                    <li><strong>Culture:</strong> Strength of museums, architecture, history, and local character.</li>
                    <li><strong>Nightlife:</strong> Energy after dark, from late dinners to bars and social scenes.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="snapshot-summary">
              {getSnapshotSummary(story).map((item) => (
                <span className="snapshot-pill" key={item.label}>
                  <strong>{item.label}:</strong> {item.value}
                </span>
              ))}
            </div>
            <div className="score-breakdown">
              {breakdownScores.map(([label, score]) => (
                <div className="score-bar__row" key={label}>
                  <div className="score-bar__top">
                    <span className="score-bar__label">{label}</span>
                    <span className="score-bar__value">{score}/10</span>
                  </div>
                  <div className="score-bar__track">
                    <div
                      className="score-bar__fill"
                      style={{ "--score-width": `${score * 10}%` } as CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-card sidebar-card--tags">
            <h4 className="sidebar-card__title">Tags</h4>
            <div className="sidebar-tags">
              {story.tags.map((tag) => (
                <span className="sidebar-tag" key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
