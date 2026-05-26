import type { CSSProperties } from "react";
import Link from "next/link";
import { ItineraryTabs } from "./ItineraryTabs";
import { SiteFooter } from "./SiteFooter";
import {
  getBreakdownScores,
  getBudgetTier,
  getSnapshotSummary,
  type TravelBlog
} from "../../lib/site-content";

export function StoryPage({ story }: { story: TravelBlog }) {
  const hasNotes = Boolean(story.warnings?.length || story.skipIf?.length);

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
              <div className="stat__value">{story.stats.walkScore}</div>
              <div className="stat__label">Walkability</div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="blog-content">
        <div className="blog-main">
          <section className="content-section mobile-guide">
            <div className="content-section__header">
              <div className="content-section__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h10" />
                </svg>
              </div>
              <div>
                <h2 className="content-section__title">In This Guide</h2>
                <p className="content-section__subtitle">Jump straight to the section you need.</p>
              </div>
            </div>
            <div className="mobile-guide__list">
              {story.itinerary?.length ? <a className="mobile-guide__item" href="#section-itinerary">Itinerary</a> : null}
              {story.food?.length ? <a className="mobile-guide__item" href="#section-food">Food Spots</a> : null}
              {story.gems?.length ? <a className="mobile-guide__item" href="#section-gems">Hidden Gems</a> : null}
              {story.highlights?.length ? <a className="mobile-guide__item" href="#section-highlights">Highlights</a> : null}
              {story.budgetBreakdown?.length ? <a className="mobile-guide__item" href="#section-budget">Budget Breakdown</a> : null}
              {hasNotes ? <a className="mobile-guide__item" href="#section-notes">Warnings</a> : null}
            </div>
          </section>

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
              <ItineraryTabs itinerary={story.itinerary} storyId={story.id} />
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
                  <p className="content-section__subtitle">Where we actually ate (and went back twice)</p>
                </div>
              </div>
              <div className="food-grid">
                {story.food.map((place, index) => (
                  <div className="food-card" key={`${place.name}-${index}`}>
                    <span className="food-card__index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="food-card__body">
                      <h3 className="food-card__name">{place.name}</h3>
                      {place.cuisine ? <span className="food-card__cuisine">{place.cuisine}</span> : null}
                      {place.desc ? <p className="food-card__desc">{place.desc}</p> : null}
                      {place.price ? <span className="food-card__price">{place.price}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
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
                  <h2 className="content-section__title">Hidden Gems</h2>
                  <p className="content-section__subtitle">The stuff guidebooks don&apos;t tell you</p>
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
        </div>

        <aside className="blog-sidebar">
          {story.itinerary?.length ? (
            <div className="sidebar-card">
              <h4 className="sidebar-card__title">In This Guide</h4>
              <ul className="toc-list">
                {story.itinerary?.length ? <li><a href="#section-itinerary">Itinerary</a></li> : null}
                {story.food?.length ? <li><a href="#section-food">Best Food Spots</a></li> : null}
                {story.gems?.length ? <li><a href="#section-gems">Hidden Gems</a></li> : null}
                {story.highlights?.length ? <li><a href="#section-highlights">Highlights</a></li> : null}
                {story.budgetBreakdown?.length ? <li><a href="#section-budget">Budget Breakdown</a></li> : null}
                {hasNotes ? <li><a href="#section-notes">Warnings and Skip If</a></li> : null}
              </ul>
            </div>
          ) : null}

          <div className="sidebar-card">
            <h4 className="sidebar-card__title">City Snapshot</h4>
            <div className="snapshot-summary">
              {getSnapshotSummary(story).map((item) => (
                <span className="snapshot-pill" key={item.label}>
                  <strong>{item.label}:</strong> {item.value}
                </span>
              ))}
            </div>
            <div className="score-breakdown">
              {getBreakdownScores(story).map(([label, score]) => (
                <div className="score-bar__row" key={label}>
                  <div className="score-bar__top">
                    <span className="score-bar__label">{label}</span>
                    <span className="score-bar__value">{score}</span>
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

          <div className="sidebar-card">
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
