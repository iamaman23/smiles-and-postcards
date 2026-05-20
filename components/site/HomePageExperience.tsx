"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getBudgetRange,
  getDestinationPath,
  getVibeIndicator,
  type TravelBlog
} from "../../lib/site-content";

type AdvancedFilters = {
  continent: string;
  country: string;
  budgetRange: string;
  itineraryLength: string;
  travelStyle: string;
  smartScore: string;
  smartScoreMin: string;
  finalScore: string;
};

const DEFAULT_FILTERS = [
  { label: "All", tag: "all" },
  { label: "Europe", tag: "europe" },
  { label: "Asia", tag: "asia" },
  { label: "Food", tag: "food" },
  { label: "Budget", tag: "budget" },
  { label: "Culture", tag: "culture" }
];

const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  continent: "all",
  country: "all",
  budgetRange: "all",
  itineraryLength: "all",
  travelStyle: "all",
  smartScore: "all",
  smartScoreMin: "all",
  finalScore: "all"
};

const SMART_SCORE_OPTIONS = [
  { key: "walkability", label: "Walkability" },
  { key: "affordability", label: "Affordability" },
  { key: "safety", label: "Safety" },
  { key: "food", label: "Food" },
  { key: "culture", label: "Culture" },
  { key: "nightlife", label: "Nightlife" },
  { key: "nature", label: "Nature" },
  { key: "connectivity", label: "Connectivity" },
  { key: "familyFriendly", label: "Family Friendly" }
];

const FINAL_SCORE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "7.5", label: "Strong Match 7.5+" },
  { value: "8", label: "Great Match 8+" },
  { value: "8.5", label: "Best Match 8.5+" }
];

const HOME_FILTER_ALIASES: Record<string, string[]> = {
  food: ["food", "foodie", "culinary", "street-food", "food-and-drink", "gastronomy"],
  budget: ["budget", "affordable", "cheap", "backpacking", "backpacker"],
  culture: ["culture", "cultural", "heritage", "historic", "history", "museum", "art"],
  europe: ["europe"],
  asia: ["asia"]
};

function slugify(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  return false;
}

function matchesAdvancedFilters(blog: TravelBlog, filters: AdvancedFilters) {
  const budgetRange = getBudgetRange(parseBudgetValue(blog.budget));
  const itineraryLength = getItineraryBucket(Number(blog.days) || 0);
  const smartScoreValue = filters.smartScore === "all"
    ? null
    : clampScore(blog?.scores?.[filters.smartScore], 7);
  const smartScoreMin = filters.smartScoreMin === "all" ? null : Number(filters.smartScoreMin);
  const finalScoreMin = filters.finalScore === "all" ? null : Number(filters.finalScore);

  return (
    (filters.continent === "all" || blog?.meta?.continent === filters.continent) &&
    (filters.country === "all" || blog.country === filters.country) &&
    (filters.budgetRange === "all" || budgetRange === filters.budgetRange) &&
    (filters.itineraryLength === "all" || itineraryLength === filters.itineraryLength) &&
    (filters.travelStyle === "all" || blog.travelStyles.includes(filters.travelStyle)) &&
    (filters.smartScore === "all" || smartScoreValue != null) &&
    (smartScoreMin == null || filters.smartScore === "all" || (smartScoreValue != null && smartScoreValue >= smartScoreMin)) &&
    (finalScoreMin == null || Number(blog.finalScore || 0) >= finalScoreMin)
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

  const countries = useMemo(() => {
    const scopedStories = advancedFilters.continent === "all"
      ? visibleStories
      : visibleStories.filter((blog) => blog?.meta?.continent === advancedFilters.continent);
    return [...new Set(scopedStories.map((blog) => blog.country).filter((value): value is string => Boolean(value)))].sort();
  }, [advancedFilters.continent, visibleStories]);

  const travelStyles = useMemo(
    () => [...new Set(visibleStories.flatMap((blog) => blog.travelStyles).filter(Boolean))].sort(),
    [visibleStories]
  );

  useEffect(() => {
    if (advancedFilters.country !== "all" && !countries.includes(advancedFilters.country)) {
      setAdvancedFilters((current) => ({ ...current, country: "all" }));
    }
  }, [advancedFilters.country, countries]);

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
                placeholder="Search a city, country, or vibe..."
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
                Explore
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

          <div className="hero__quicklist">
            {[
              { city: "Kyoto", label: "Quiet Mornings" },
              { city: "Lisbon", label: "Sunlit Cities" },
              { city: "Bali", label: "Remote Reset" }
            ].map((item) => (
              <button
                className="hero__quicklink"
                type="button"
                key={item.city}
                onClick={() => {
                  setSearchInput(item.city);
                  const matched = visibleStories.find((story) => slugify(story.city) === slugify(item.city));
                  if (matched) navigateToStory(matched);
                }}
              >
                {item.label}
              </button>
            ))}
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
          <aside className="home-filters">
            <h3 className="home-filters__title">Refine the route</h3>
            <p className="home-filters__hint">Narrow the shelf by geography, pace, budget, and travel mood.</p>

            <div className="home-filters__group">
              <label className="home-filters__label" htmlFor="filter-continent">Continent</label>
              <select
                className="home-filters__control"
                id="filter-continent"
                value={advancedFilters.continent}
                onChange={(event) => setAdvancedFilters((current) => ({ ...current, continent: event.target.value }))}
              >
                <option value="all">All</option>
                {continents.map((value) => (
                  <option value={value} key={value}>{value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}</option>
                ))}
              </select>
            </div>

            <div className="home-filters__group">
              <label className="home-filters__label" htmlFor="filter-country">Country</label>
              <select
                className="home-filters__control"
                id="filter-country"
                value={advancedFilters.country}
                onChange={(event) => setAdvancedFilters((current) => ({ ...current, country: event.target.value }))}
              >
                <option value="all">All</option>
                {countries.map((value) => (
                  <option value={value} key={value}>{value}</option>
                ))}
              </select>
            </div>

            <div className="home-filters__group">
              <label className="home-filters__label" htmlFor="filter-budget-range">Budget Range</label>
              <select
                className="home-filters__control"
                id="filter-budget-range"
                value={advancedFilters.budgetRange}
                onChange={(event) => setAdvancedFilters((current) => ({ ...current, budgetRange: event.target.value }))}
              >
                <option value="all">All</option>
                <option value="budget">Under 50/day</option>
                <option value="mid">50-120/day</option>
                <option value="luxury">120+/day</option>
              </select>
            </div>

            <div className="home-filters__group">
              <label className="home-filters__label" htmlFor="filter-itinerary">Itinerary Length</label>
              <select
                className="home-filters__control"
                id="filter-itinerary"
                value={advancedFilters.itineraryLength}
                onChange={(event) => setAdvancedFilters((current) => ({ ...current, itineraryLength: event.target.value }))}
              >
                <option value="all">All</option>
                <option value="short">1-3 days</option>
                <option value="medium">4-6 days</option>
                <option value="long">7+ days</option>
              </select>
            </div>

            <div className="home-filters__group">
              <label className="home-filters__label" htmlFor="filter-travel-style">Travel Style</label>
              <select
                className="home-filters__control"
                id="filter-travel-style"
                value={advancedFilters.travelStyle}
                onChange={(event) => setAdvancedFilters((current) => ({ ...current, travelStyle: event.target.value }))}
              >
                <option value="all">All</option>
                {travelStyles.map((value) => (
                  <option value={value} key={value}>{value.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            <details className="home-filters__smart" open>
              <summary>Smart score filters</summary>
              <div className="home-filters__smart-body">
                <p className="home-filters__subhint">Use weighted scores when you already know what matters most on this trip.</p>

                <div className="home-filters__group">
                  <label className="home-filters__label" htmlFor="filter-smart-score">Score Focus</label>
                  <select
                    className="home-filters__control"
                    id="filter-smart-score"
                    value={advancedFilters.smartScore}
                    onChange={(event) => setAdvancedFilters((current) => ({ ...current, smartScore: event.target.value }))}
                  >
                    <option value="all">All</option>
                    {SMART_SCORE_OPTIONS.map((option) => (
                      <option value={option.key} key={option.key}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="home-filters__group">
                  <label className="home-filters__label" htmlFor="filter-smart-score-min">Selected Score Minimum</label>
                  <select
                    className="home-filters__control"
                    id="filter-smart-score-min"
                    value={advancedFilters.smartScoreMin}
                    onChange={(event) => setAdvancedFilters((current) => ({ ...current, smartScoreMin: event.target.value }))}
                  >
                    <option value="all">All</option>
                    {["7", "8", "9"].map((value) => (
                      <option value={value} key={value}>{value}+ on selected score</option>
                    ))}
                  </select>
                </div>

                <div className="home-filters__group">
                  <label className="home-filters__label" htmlFor="filter-final-score">Smart Match</label>
                  <select
                    className="home-filters__control"
                    id="filter-final-score"
                    value={advancedFilters.finalScore}
                    onChange={(event) => setAdvancedFilters((current) => ({ ...current, finalScore: event.target.value }))}
                  >
                    {FINAL_SCORE_OPTIONS.map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </details>

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
              Reset Filters
            </button>
          </aside>

          <div className="pinned-content">
            <div className="filter-bar" id="filter-bar">
              {DEFAULT_FILTERS.map((filter) => (
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
                        <strong>Walk {blog?.scores?.walkability ?? 7}</strong> | <strong>Food {blog?.scores?.food ?? 8}</strong> | <strong>Safe {blog?.scores?.safety ?? 7}</strong>
                      </div>
                    </div>
                  </Link>
                );
              }) : (
                <div className="search-results__empty"><span>No close match yet</span>Try a broader place, season, or travel mood.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
