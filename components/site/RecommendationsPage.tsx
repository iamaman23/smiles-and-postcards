import Link from "next/link";
import {
  type RecommendationDoc,
  type TravelBlog,
  getDestinationPath,
  getVibeIndicator
} from "../../lib/site-content";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";
import { RecommendationsGate } from "./RecommendationsGate";

type RecommendationsPageProps = {
  recommendations: RecommendationDoc[];
  activeRecommendation: RecommendationDoc | null;
  activeBlogs: TravelBlog[];
};

function getRecommendationSummaryPills(recommendation: RecommendationDoc) {
  const filters = recommendation.filters || {};
  const pills: string[] = [];
  if (typeof filters.continent === "string") pills.push(filters.continent);
  if (Array.isArray(filters.travelStyles)) pills.push(...filters.travelStyles.map((value) => String(value).replace(/_/g, " ")));
  if (Array.isArray(filters.tags)) pills.push(...filters.tags.map((value) => String(value).replace(/_/g, " ")));
  if (typeof (filters as any).bestSeason === "string") pills.push((filters as any).bestSeason);
  if ((filters as any).experience?.pace) pills.push(`${(filters as any).experience.pace} pace`);
  Object.entries(((filters as any).scores || {}) as Record<string, unknown>).forEach(([key, value]) => pills.push(`${key} ${value}+`));
  return pills.slice(0, 4);
}

export function RecommendationsPage({
  recommendations,
  activeRecommendation,
  activeBlogs
}: RecommendationsPageProps) {
  const fallbackRecommendation = activeRecommendation || recommendations[0] || null;

  return (
    <>
      <SiteNav />
      <main>
        <RecommendationsGate />

        <section className="reco-page reco-access__content" id="recommendations-content">
          <div className="reco-hero reveal">
            <div className="reco-hero__copy">
              <span className="reco-hero__tag">Curated routes</span>
              <h1 className="reco-hero__title">Start with a mood.<br />Then follow the route.</h1>
              <p className="reco-hero__text">
                These recommendation lanes group together recurring travel intentions such as budget
                Europe, food-first Asia, romantic escapes, and digital nomad hubs. Each one
                resolves to ranked itineraries already waiting in the city library.
              </p>
            </div>
            <div className="reco-hero__note">
              <h2 className="section-title" style={{ color: "#fff" }}>Editorial discovery, not booking noise</h2>
              <p>Instead of front-loading complexity, we begin with recognizable travel moods and let readers move into ranked city picks when they are ready.</p>
            </div>
          </div>

          <div className="reco-shell reveal">
            <aside className="reco-shell__sidebar">
              <h2 className="reco-sidebar__title">Recommendation sets</h2>
              <p className="reco-sidebar__hint">Choose a travel lane and we will open the ranked cities already attached to complete itinerary pages.</p>
              <div className="reco-intent-grid" id="recommendation-grid">
                {recommendations.map((item, index) => (
                  <Link
                    key={item.id}
                    className={`reco-intent-card ${fallbackRecommendation?.id === item.id ? "active" : ""}`}
                    href={`/recommendations/${item.id}`}
                  >
                    <div className="reco-intent-card__eyebrow">Intent {String(index + 1).padStart(2, "0")}</div>
                    <h3 className="reco-intent-card__title">{item.title}</h3>
                    <p className="reco-intent-card__desc">{item.description}</p>
                    <div className="reco-intent-card__meta">
                      {getRecommendationSummaryPills(item).map((value) => (
                        <span className="reco-pill" key={`${item.id}-${value}`}>{value}</span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </aside>

            <section className="reco-shell__content">
              <div id="recommendation-detail">
                {fallbackRecommendation ? (
                  <>
                    <div className="reco-results__header">
                      <div>
                        <div className="reco-results__eyebrow">Curated lane</div>
                        <h2 className="reco-results__title">{fallbackRecommendation.title}</h2>
                        <p className="reco-results__desc">{fallbackRecommendation.description}</p>
                      </div>
                      <div className="reco-results__meta">
                        {activeBlogs.length} ranked cities with itinerary pages ready
                      </div>
                    </div>
                    <div className="reco-intent-card__meta" style={{ marginTop: "1rem" }}>
                      {getRecommendationSummaryPills(fallbackRecommendation).map((value) => (
                        <span className="reco-pill" key={`summary-${value}`}>{value}</span>
                      ))}
                    </div>
                    <div className="reco-results__cities">
                      {activeBlogs.map((blog, index) => (
                        <div key={blog.id} style={{ position: "relative" }}>
                          <span className="reco-city-rank">#{index + 1}</span>
                          <Link className="blog-card blog-card--std" href={getDestinationPath(blog)}>
                            <div className="blog-card__img-wrap">
                              <img className="blog-card__img" src={blog.image} alt={blog.city} loading="lazy" />
                            </div>
                            <div className="blog-card__body">
                              <span className="blog-card__country">{blog.country}</span>
                              <h3 className="blog-card__title">{blog.title}</h3>
                              <p className="blog-card__excerpt">{blog.excerpt}</p>
                              <div className="blog-card__signals">
                                <span className="blog-card__vibe">{getVibeIndicator(blog)}</span>
                                <span className="blog-card__context">
                                  <span className="blog-card__context-line"><strong>{blog.days} days</strong> · Best in <strong>{blog.bestSeason?.split(",")[0] || "Year-round"}</strong></span>
                                </span>
                              </div>
                              <div className="blog-card__meta">
                                <strong>Walk {blog?.scores?.walkability ?? 7}</strong> | <strong>Food {blog?.scores?.food ?? 8}</strong> | <strong>Safe {blog?.scores?.safety ?? 7}</strong>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="reco-empty">No recommendation sets available yet.</div>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
