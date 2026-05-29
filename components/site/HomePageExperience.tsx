"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getBudgetRange,
  getDestinationPath,
  getVibeIndicator,
  type TravelBlog
} from "../../lib/site-content";

type AdvancedFilters = {
  continent: string;
  budgetRange: string;
  itineraryLength: string;
  travelMonth: string;
  travelStyle: string;
};

type ScoreKey = "walkability" | "food" | "safety";

const HOME_INTENT_FILTERS = [
  { label: "Any trip", tag: "all" },
  { label: "Food & markets", tag: "food" },
  { label: "Culture & history", tag: "culture" },
  { label: "Budget-friendly", tag: "budget" },
  { label: "Slow & quiet", tag: "slow" }
];

const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  continent: "all",
  budgetRange: "all",
  itineraryLength: "all",
  travelMonth: "all",
  travelStyle: "all"
};

const TRAVEL_MONTHS = [
  { value: "january", label: "January" },
  { value: "february", label: "February" },
  { value: "march", label: "March" },
  { value: "april", label: "April" },
  { value: "may", label: "May" },
  { value: "june", label: "June" },
  { value: "july", label: "July" },
  { value: "august", label: "August" },
  { value: "september", label: "September" },
  { value: "october", label: "October" },
  { value: "november", label: "November" },
  { value: "december", label: "December" }
] as const;

const MONTH_TO_SEASON: Record<string, string> = {
  january: "winter",
  february: "winter",
  march: "spring",
  april: "spring",
  may: "spring",
  june: "summer",
  july: "summer",
  august: "summer",
  september: "autumn",
  october: "autumn",
  november: "autumn",
  december: "winter"
};

const HOME_SCORE_COPY: Record<ScoreKey, { label: string; description: string }> = {
  walkability: {
    label: "Walk",
    description: "How easy it is to explore on foot without planning your whole day around transport."
  },
  food: {
    label: "Food",
    description: "How consistently rewarding the eating scene feels, from standout meals to casual local staples."
  },
  safety: {
    label: "Safe",
    description: "How comfortable most travelers should feel with normal city awareness."
  }
};

const HOME_FILTER_ALIASES: Record<string, string[]> = {
  food: ["food", "foodie", "culinary", "street-food", "food-and-drink", "gastronomy"],
  budget: ["budget", "affordable", "cheap", "backpacking", "backpacker"],
  culture: ["culture", "cultural", "heritage", "historic", "history", "museum", "art"],
  slow: ["slow-travel", "quiet", "relaxed", "nature", "offbeat", "hidden-gems"]
};

function slugify(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toProperCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getVisibleHomeBlogs(stories: TravelBlog[]) {
  return stories.filter((story) => story.showOnHome !== false && story.pinned !== false);
}

function getCardSeason(blog: TravelBlog) {
  return blog.bestSeason ? blog.bestSeason.split(",")[0] : "Year-round";
}

function getCardTripLength(blog: TravelBlog) {
  return blog.days === 1 ? "1 day" : `${blog.days} days`;
}

function getItineraryBucket(days: number) {
  if (days <= 3) return "short";
  if (days <= 6) return "medium";
  return "long";
}

function deriveSeasonTokens(bestSeason: unknown) {
  const raw = String(bestSeason || "").toLowerCase();
  const tokens = new Set(raw.split(/[^a-z]+/g).map(slugify).filter(Boolean));

  Object.entries(MONTH_TO_SEASON).forEach(([month, season]) => {
    if (raw.includes(month)) tokens.add(season);
  });

  return tokens;
}

function matchesTravelMonth(bestSeason: unknown, travelMonth: string) {
  if (travelMonth === "all") return true;
  const month = travelMonth.toLowerCase();
  const season = MONTH_TO_SEASON[month];
  const tokens = deriveSeasonTokens(bestSeason);
  return tokens.has(month) || (season ? tokens.has(season) : false);
}

function parseBudgetValue(budget: unknown) {
  const raw = String(budget || "").replace(/,/g, "");
  const match = raw.match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function clampScore(value: unknown, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.min(10, numeric));
}

function getSearchScore(blog: TravelBlog, query: string) {
  const city = String(blog.city || "").toLowerCase();
  const country = String(blog.country || "").toLowerCase();
  const title = String(blog.title || "").toLowerCase();
  const excerpt = String(blog.excerpt || "").toLowerCase();
  const tags = Array.isArray(blog.tags) ? blog.tags.join(" ").toLowerCase() : "";

  if (city.startsWith(query)) return 0;
  if (city.includes(query)) return 1;
  if (country.startsWith(query)) return 2;
  if (country.includes(query)) return 3;
  if (title.includes(query)) return 4;
  if (tags.includes(query)) return 5;
  if (excerpt.includes(query)) return 6;
  return 7;
}

function matchesHomeFilter(blog: TravelBlog, filterTag: string) {
  if (filterTag === "all") return true;

  const normalizedFilter = slugify(filterTag);
  const aliases = HOME_FILTER_ALIASES[normalizedFilter] || [normalizedFilter];
  const tokens = new Set([
    ...blog.tags.map(slugify),
    ...blog.travelStyles.map(slugify),
    slugify(blog.meta?.continent),
    slugify(blog.country),
    slugify(blog.city)
  ].filter(Boolean));

  if (aliases.some((alias) => tokens.has(alias))) return true;
  if (normalizedFilter === "food" && clampScore(blog?.scores?.food, 0) >= 8) return true;
  if (normalizedFilter === "budget" && getBudgetRange(parseBudgetValue(blog?.budget)) === "budget") return true;
  if (normalizedFilter === "culture" && clampScore(blog?.scores?.culture, 0) >= 8) return true;
  if (normalizedFilter === "slow" && slugify(blog?.experience?.pace) === "relaxed") return true;
  if (normalizedFilter === "slow" && clampScore(blog?.scores?.nature, 0) >= 8) return true;
  return false;
}

function matchesAdvancedFilters(blog: TravelBlog, filters: AdvancedFilters) {
  const budgetRange = getBudgetRange(parseBudgetValue(blog.budget));
  const itineraryLength = getItineraryBucket(Number(blog.days) || 0);

  return (
    (filters.continent === "all" || blog?.meta?.continent === filters.continent) &&
    (filters.budgetRange === "all" || budgetRange === filters.budgetRange) &&
    (filters.itineraryLength === "all" || itineraryLength === filters.itineraryLength) &&
    matchesTravelMonth(blog.bestSeason, filters.travelMonth) &&
    (filters.travelStyle === "all" || blog.travelStyles.includes(filters.travelStyle))
  );
}

function selectBalancedPinnedBlogs(blogs: TravelBlog[]) {
  const featured = blogs.filter((blog) => blog.featured).slice(0, 2);
  const standard = blogs.filter((blog) => !blog.featured).slice(0, 6);
  return { featured, standard };
}

export function HomePageExperience({ stories }: { stories: TravelBlog[] }) {
  const router = useRouter();
  const visibleStories = useMemo(() => getVisibleHomeBlogs(stories), [stories]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(DEFAULT_ADVANCED_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const deferredSearchInput = useDeferredValue(searchInput);

  const continents = useMemo(
    () => [...new Set(visibleStories.map((blog) => blog?.meta?.continent).filter((value): value is string => Boolean(value)))].sort(),
    [visibleStories]
  );

  const travelStyles = useMemo(
    () => [...new Set(visibleStories.flatMap((blog) => blog.travelStyles).filter(Boolean))].sort(),
    [visibleStories]
  );

  const suggestions = useMemo(() => {
    const query = deferredSearchInput.trim().toLowerCase();
    if (!query) return [];
    return [...visibleStories]
      .filter((blog) => getSearchScore(blog, query) < 7)
      .sort((a, b) => getSearchScore(a, query) - getSearchScore(b, query))
      .slice(0, 6);
  }, [deferredSearchInput, visibleStories]);

  const filteredStories = useMemo(() => {
    const normalizedQuery = activeSearchQuery.trim().toLowerCase();
    return visibleStories
      .filter((blog) => matchesHomeFilter(blog, activeFilter) && matchesAdvancedFilters(blog, advancedFilters))
      .filter((blog) => {
        if (!normalizedQuery) return true;
        return getSearchScore(blog, normalizedQuery) < 7;
      })
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [activeFilter, activeSearchQuery, advancedFilters, visibleStories]);

  const layout = useMemo(() => selectBalancedPinnedBlogs(filteredStories), [filteredStories]);
  const cards = useMemo(
    () => [
      ...layout.featured.map((blog, index) => ({
        blog,
        kind: index === 0 ? "featured-left" : "featured-right"
      })),
      ...layout.standard.map((blog) => ({ blog, kind: "standard" }))
    ],
    [layout]
  );

  function navigateToStory(blog: TravelBlog) {
    setShowSuggestions(false);
    startTransition(() => {
      router.push(getDestinationPath(blog));
    });
  }

  function runSearch(query: string) {
    const normalized = query.trim();
    if (!normalized) {
      setActiveSearchQuery("");
      return;
    }

    const exact = suggestions.find((blog) => slugify(blog.city) === slugify(normalized) || slugify(blog.country) === slugify(normalized));
    if (exact) {
      navigateToStory(exact);
      return;
    }

    if (suggestions.length === 1) {
      navigateToStory(suggestions[0]);
      return;
    }

    setActiveSearchQuery(normalized);
    setShowSuggestions(false);
    document.getElementById("pinned-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main>
      <section className="hero" id="hero">
        <div className="hero__bg"></div>
        <div className="hero__content">
          <p className="hero__tag">Field guide to thoughtful travel</p>
          <h1 className="hero__title">Travel <em>slower</em>.<br />See more.</h1>
          <p className="hero__subtitle">
            Editorial itineraries, small local finds, and grounded budgets for travelers who want
            places to unfold at a human pace.
          </p>

          <div className="search-wrap">
            <div className="search" id="hero-search">
              <svg className="search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="search__input"
                type="text"
                id="search-input"
                placeholder="Search destinations or travel moods"
                autoComplete="off"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    runSearch(searchInput);
                  }
                  if (event.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
              />
              <button
                className={`search__clear${searchInput.trim() ? " visible" : ""}`}
                id="search-clear"
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchInput("");
                  setActiveSearchQuery("");
                  setShowSuggestions(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <button className="search__btn" id="search-submit" type="button" onClick={() => runSearch(searchInput)}>
                Find trips
              </button>
            </div>
            <div className={`search-suggestions${showSuggestions && suggestions.length ? " active" : ""}`} id="search-suggestions">
              {suggestions.map((blog) => (
                <button
                  className="search-suggestions__item"
                  type="button"
                  key={blog.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => navigateToStory(blog)}
                >
                  <span className="search-suggestions__city">{blog.city}, {blog.country}</span>
                  <span className="search-suggestions__meta">{blog.title}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
        <div className="hero__scroll">
          <span>Keep drifting</span>
          <div className="hero__scroll-line"></div>
        </div>
      </section>

      <section className="search-results" id="search-results"></section>

      <section className="travel-note reveal">
        <div className="travel-note__inner">
          <p className="travel-note__quote">The best trips leave enough daylight for a wrong turn that turns out right.</p>
          <span className="travel-note__mark">from the notebook</span>
        </div>
      </section>

      <section className="pinned reveal" id="pinned-section">
        <div className="section-header">
          <span className="section-tag">Pinned journeys</span>
          <h2 className="section-title">Stories worth lingering in</h2>
          <div className="section-line"></div>
        </div>

        <div className="pinned-layout">
          <aside className="home-discovery">
            <div className="home-discovery__intro">
              <h3 className="home-discovery__title">Find your kind of trip</h3>
              <p className="home-discovery__hint">Start with a feeling. You can narrow by region, budget, or vibe only if you want to.</p>
            </div>

            <div className="home-discovery__primary">
              <div className="home-discovery__row">
                <div className="home-filters__group home-filters__group--compact">
                  <label className="home-filters__label" htmlFor="filter-itinerary">Trip length</label>
                  <select
                    className="home-filters__control"
                    id="filter-itinerary"
                    value={advancedFilters.itineraryLength}
                    onChange={(event) => setAdvancedFilters((current) => ({ ...current, itineraryLength: event.target.value }))}
                  >
                    <option value="all">Any length</option>
                    <option value="short">Quick escape, 1 to 3 days</option>
                    <option value="medium">Long weekend, 4 to 6 days</option>
                    <option value="long">Settle in, 7 days or more</option>
                  </select>
                </div>

                <div className="home-filters__group home-filters__group--compact">
                  <label className="home-filters__label" htmlFor="filter-travel-month">Travel month</label>
                  <select
                    className="home-filters__control"
                    id="filter-travel-month"
                    value={advancedFilters.travelMonth}
                    onChange={(event) => setAdvancedFilters((current) => ({ ...current, travelMonth: event.target.value }))}
                  >
                    <option value="all">Any time of year</option>
                    {TRAVEL_MONTHS.map((month) => (
                      <option value={month.value} key={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn home-filters__reset"
                  id="home-filters-reset"
                  type="button"
                  onClick={() => {
                    setActiveFilter("all");
                    setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
                    setActiveSearchQuery("");
                    setSearchInput("");
                  }}
                >
                  Clear all
                </button>
              </div>
            </div>

            <details className="home-filters home-filters--advanced">
              <summary>More filters</summary>
              <div className="home-filters__smart-body">
                <p className="home-filters__subhint">Use these once you already know the shape of the trip you want.</p>

                <div className="home-filters__grid">
                  <div className="home-filters__group">
                    <label className="home-filters__label" htmlFor="filter-continent">Region</label>
                    <select
                      className="home-filters__control"
                      id="filter-continent"
                      value={advancedFilters.continent}
                      onChange={(event) => setAdvancedFilters((current) => ({ ...current, continent: event.target.value }))}
                    >
                      <option value="all">Anywhere</option>
                      {continents.map((value) => (
                        <option value={value} key={value}>{toProperCase(value)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="home-filters__group">
                    <label className="home-filters__label" htmlFor="filter-budget-range">Budget</label>
                    <select
                      className="home-filters__control"
                      id="filter-budget-range"
                      value={advancedFilters.budgetRange}
                      onChange={(event) => setAdvancedFilters((current) => ({ ...current, budgetRange: event.target.value }))}
                    >
                      <option value="all">Any budget</option>
                      <option value="budget">Budget-friendly, under 50 a day</option>
                      <option value="mid">Balanced, 50 to 120 a day</option>
                      <option value="luxury">More indulgent, 120 plus a day</option>
                    </select>
                  </div>

                  <div className="home-filters__group">
                    <label className="home-filters__label" htmlFor="filter-travel-style">Trip vibe</label>
                    <select
                      className="home-filters__control"
                      id="filter-travel-style"
                      value={advancedFilters.travelStyle}
                      onChange={(event) => setAdvancedFilters((current) => ({ ...current, travelStyle: event.target.value }))}
                    >
                      <option value="all">Any vibe</option>
                      {travelStyles.map((value) => (
                        <option value={value} key={value}>{toProperCase(value)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </details>
          </aside>

          <div className="pinned-content">
            <div className="filter-bar" id="filter-bar">
              {HOME_INTENT_FILTERS.map((filter) => (
                <button
                  className={`filter-chip ${activeFilter === filter.tag ? "active" : ""}`}
                  type="button"
                  key={filter.tag}
                  onClick={() => setActiveFilter(filter.tag)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="home-score-guide" aria-label="Editorial score explanation">
              <div className="home-score-guide__heading">
                <strong>What the scores mean</strong>
                <span>10-point editorial signals, meant for quick comparison rather than hard guarantees.</span>
              </div>
              <div className="home-score-guide__legend">
                {(["walkability", "food", "safety"] as ScoreKey[]).map((key) => (
                  <div className={`home-score-guide__item home-score-guide__item--${key}`} key={key}>
                    <span className={`home-score-guide__pill home-score-guide__pill--${key}`}>{HOME_SCORE_COPY[key].label}</span>
                    <p>{HOME_SCORE_COPY[key].description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="blog-grid" id="blog-grid">
            {cards.length ? cards.map(({ blog, kind }) => {
              const isFeatured = kind !== "standard";
              const className = isFeatured
                ? `blog-card blog-card--featured ${kind === "featured-left" ? "blog-card--featured-left" : "blog-card--featured-right"}`
                : "blog-card blog-card--std";

              return (
                <Link className={className} href={getDestinationPath(blog)} key={blog.id}>
                  <div className="blog-card__img-wrap">
                    <img className="blog-card__img" src={blog.image} alt={blog.city} loading="lazy" />
                  </div>
                  {isFeatured ? (
                    <>
                      <div className="blog-card__overlay"></div>
                      <span className="blog-card__badge">Editor&apos;s pick</span>
                    </>
                  ) : null}
                  <div className="blog-card__body">
                    <span className="blog-card__country">{blog.country}</span>
                    <h3 className="blog-card__title">{blog.title}</h3>
                    <p className="blog-card__excerpt">{blog.excerpt}</p>
                    <div className="blog-card__signals">
                      <span className="blog-card__vibe">{getVibeIndicator(blog)}</span>
                      <span className="blog-card__context">
                        <span className="blog-card__context-line">
                          <strong>{getCardTripLength(blog)}</strong> · Best in <strong>{getCardSeason(blog)}</strong>
                        </span>
                      </span>
                    </div>
                    <div className="blog-card__meta">
                      {(["walkability", "food", "safety"] as ScoreKey[]).map((key) => (
                        <span className="blog-card__score" key={`${blog.id}-${key}`} title={HOME_SCORE_COPY[key].description}>
                          <strong>{HOME_SCORE_COPY[key].label} {blog?.scores?.[key] ?? (key === "food" ? 8 : 7)}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            }) : (
              <div className="search-results__empty"><span>No close match yet</span>Try a broader mood, a different region, or a more flexible trip length.</div>
            )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
