import { RECOMMENDATION_INTENTS } from "./recommendation-intents";
import {
  buildRecommendationDocument,
  buildStructuredBlogs,
  normalizeLoadedBlog,
  normalizeRecommendationDoc,
  slugify,
  sortPostsByCreatedAt,
  type ContentDocument,
  type RecommendationDoc,
  type TravelBlog
} from "./site-content";
import { deleteRows, patchRows, selectRowsFresh, upsertRows } from "./supabase-rest";

type PlaceDraft = {
  id?: string;
  cityId?: string;
  kind?: string;
  name?: string;
  title?: string;
  desc?: string;
  description?: string;
  tip?: string;
  cuisine?: string;
  price?: string;
  image?: string;
};

type BlogDraft = TravelBlog & {
  version?: number;
  geo?: Record<string, unknown>;
  budgetSymbol?: string;
};

type CityRow = Record<string, unknown> & { id: string };
type ItineraryRow = Record<string, unknown> & { id: string; city_id: string };
type PlaceRow = Record<string, unknown> & { id: string; city_id: string };
type RecommendationRow = Record<string, unknown> & { id: string };

function toCamelCaseKey(value: string) {
  return value.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function normalizeDocument(row: Record<string, any>): ContentDocument {
  const entries = Object.entries(row || {}).map(([key, value]) => [toCamelCaseKey(key), value]);
  const fields = Object.fromEntries(entries);
  return {
    ...fields,
    id: String(row.id || row.city_id || row.key || ""),
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined
  };
}

async function loadContentTable(table: string) {
  const rows = await selectRowsFresh<Record<string, any>>(table, new URLSearchParams({ select: "*" }));
  return rows.map(normalizeDocument);
}

function buildPlaceId(cityId: string, name: string) {
  return `${cityId}-place-${slugify(name)}`;
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function normalizeItineraryDay(day: Record<string, unknown>) {
  const explicitSpots = uniqueStrings(ensureArray<string>(day?.spots));
  return {
    ...day,
    day: String(day?.day || ""),
    title: String(day?.title || ""),
    text: String(day?.text || ""),
    spots: explicitSpots
  };
}

function normalizePlace(place: PlaceDraft, fallbackKind: string) {
  if (typeof place === "string") {
    return {
      id: "",
      cityId: "",
      kind: fallbackKind,
      name: place,
      desc: "",
      tip: "",
      cuisine: "",
      price: "",
      image: ""
    };
  }
  return {
    id: String(place.id || ""),
    cityId: String(place.cityId || ""),
    kind: String(place.kind || fallbackKind),
    name: String(place.name || place.title || ""),
    desc: String(place.desc || place.description || ""),
    tip: String(place.tip || ""),
    cuisine: String(place.cuisine || ""),
    price: String(place.price || ""),
    image: String(place.image || "")
  };
}

function buildPlaceDocuments(blog: BlogDraft, cityId: string) {
  const placesById = new Map<string, PlaceRow>();

  const registerPlace = (rawPlace: unknown, kind: string) => {
    const normalized = normalizePlace((rawPlace || {}) as PlaceDraft, kind);
    if (!normalized.name) return "";

    const placeId = buildPlaceId(cityId, normalized.name);
    const existing = placesById.get(placeId) as Partial<PlaceRow> | undefined;
    placesById.set(placeId, {
      id: placeId,
      city_id: cityId,
      city: blog.city,
      country: blog.country,
      slug: slugify(normalized.name),
      name: normalized.name,
      kind: existing?.kind === kind ? existing.kind : (existing?.kind || kind),
      kinds: [...new Set([...(Array.isArray(existing?.kinds) ? existing.kinds : []), kind])],
      desc: normalized.desc || String(existing?.desc || ""),
      tip: normalized.tip || String(existing?.tip || ""),
      cuisine: normalized.cuisine || String(existing?.cuisine || ""),
      price: normalized.price || String(existing?.price || ""),
      image: normalized.image || String(existing?.image || "")
    });
    return placeId;
  };

  const itinerary = ensureArray<Record<string, unknown>>(blog.itinerary).map((rawDay) => {
    const day = normalizeItineraryDay(rawDay);
    return {
      ...day,
      spots: ensureArray(day.spots).map((spot) => registerPlace(spot, "itinerary")).filter(Boolean)
    };
  });
  const food = ensureArray(blog.food).map((item) => registerPlace(item, "food")).filter(Boolean);
  const gems = ensureArray(blog.gems).map((item) => registerPlace(item, "gem")).filter(Boolean);

  return {
    placeDocs: [...placesById.values()],
    itinerary,
    food,
    gems
  };
}

function assertItinerarySpots(itinerary: Array<Record<string, unknown>>) {
  const invalidDay = itinerary.find((day) => !ensureArray(day?.spots).length);
  if (invalidDay) {
    throw new Error(`Each itinerary day must include destination spots before saving. Missing spots for "${String(invalidDay.title || invalidDay.day || "Untitled day")}".`);
  }
}

function buildCityDocuments(blog: BlogDraft) {
  const cityId = String(blog.cityId || blog.id || slugify(blog.city));
  const itineraryId = `${cityId}-${Number(blog.days || 3)}d`;
  const { placeDocs, itinerary, food, gems } = buildPlaceDocuments(blog, cityId);
  const cityRow: CityRow = {
    id: cityId,
    city_id: cityId,
    city: blog.city,
    country: blog.country,
    title: blog.title,
    excerpt: blog.excerpt,
    image: blog.image,
    hero_image: blog.heroImage || blog.image,
    featured: Boolean(blog.featured),
    pinned: blog.showOnHome !== false && blog.pinned !== false,
    show_on_home: blog.showOnHome !== false,
    best_season: blog.bestSeason,
    date: blog.date,
    stats: blog.stats || {},
    meta: blog.meta || {},
    geo: blog.geo || {},
    scores: blog.scores || {},
    tags: ensureArray(blog.tags),
    highlights: ensureArray(blog.highlights),
    warnings: ensureArray(blog.warnings),
    skip_if: ensureArray(blog.skipIf),
    budget: blog.budget,
    budget_breakdown: ensureArray(blog.budgetBreakdown),
    final_score: Number(blog.finalScore || 0),
    budget_symbol: blog.budgetSymbol || "$",
    recommendation_profile: blog.recommendationProfile || {}
  };
  const itineraryRow: ItineraryRow = {
    id: itineraryId,
    city_id: cityId,
    days: Number(blog.days || 3),
    travel_styles: ensureArray(blog.travelStyles),
    itinerary,
    food,
    gems
  };

  return { cityId, cityRow, itineraryRow, placeDocs };
}

function buildRecommendationRow(doc: RecommendationDoc, publishedBy: string, now: string): RecommendationRow {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    filters: doc.filters,
    ranking: doc.ranking,
    city_ids: doc.cityIds,
    ranked_cities: doc.rankedCities,
    result_count: doc.resultCount,
    cover_city_id: doc.coverCityId,
    updated_at: now,
    published_by: publishedBy
  };
}

function getFeaturedCount(posts: TravelBlog[], excludeId?: string) {
  return posts.filter((post) => post.featured && post.id !== excludeId).length;
}

export async function loadStoriesDirect() {
  const [cities, itineraries, places] = await Promise.all([
    loadContentTable("cities"),
    loadContentTable("itineraries"),
    loadContentTable("places")
  ]);
  return sortPostsByCreatedAt(buildStructuredBlogs(cities, itineraries, places));
}

export async function loadRecommendationsDirect() {
  const [stories, recommendationRows] = await Promise.all([
    loadStoriesDirect(),
    loadContentTable("recommendations")
  ]);
  const persistedById = new Map(recommendationRows.map((doc) => [doc.id, normalizeRecommendationDoc(doc)]));
  return RECOMMENDATION_INTENTS.map((intent) => {
    const generated = buildRecommendationDocument(intent, stories);
    const persisted = persistedById.get(intent.id);
    return persisted ? { ...persisted, ...generated } : generated;
  });
}

export async function loadHomepageSettingsDirect() {
  const rows = await selectRowsFresh<Record<string, any>>(
    "site_config",
    new URLSearchParams({
      select: "*",
      key: "eq.homepage"
    })
  );
  const row = rows[0];
  return {
    filterTags: Array.isArray(row?.filter_tags) ? row.filter_tags.map((item) => slugify(item)) : []
  };
}

export async function saveStoryDraft(draft: BlogDraft, publishedBy: string) {
  const existingSaved = await loadStoriesDirect();
  assertItinerarySpots(ensureArray<Record<string, unknown>>(draft.itinerary).map(normalizeItineraryDay));
  const { cityId, cityRow, itineraryRow, placeDocs } = buildCityDocuments(draft);
  if (draft.featured && getFeaturedCount(existingSaved, cityId) >= 2) {
    throw new Error("Only 2 featured cards are allowed. Unfeature one saved card first.");
  }

  const now = new Date().toISOString();
  await upsertRows("cities", [
    {
      ...cityRow,
      created_at: draft.createdAt || now,
      updated_at: now,
      published_by: publishedBy
    }
  ], "id");
  await upsertRows("itineraries", [
    {
      ...itineraryRow,
      created_at: draft.createdAt || now,
      updated_at: now,
      published_by: publishedBy
    }
  ], "id");

  await deleteRows("places", new URLSearchParams({ city_id: `eq.${cityId}` }));
  await upsertRows(
    "places",
    placeDocs.map((place) => ({
      ...place,
      created_at: draft.createdAt || now,
      updated_at: now,
      published_by: publishedBy
    })),
    "id"
  );

  const generatedRecommendations = await publishRecommendationsFromCurrentData(publishedBy);
  return {
    cityId,
    generatedRecommendations
  };
}

export async function publishRecommendationsFromCurrentData(publishedBy: string) {
  const stories = await loadStoriesDirect();
  if (!stories.length) {
    await deleteRows("recommendations", new URLSearchParams({ id: "not.is.null" }));
    return 0;
  }

  const now = new Date().toISOString();
  const rows = RECOMMENDATION_INTENTS.map((intent) =>
    buildRecommendationRow(buildRecommendationDocument(intent, stories), publishedBy, now)
  );
  await upsertRows("recommendations", rows, "id");
  return rows.length;
}

export async function toggleFeaturedState(id: string, nextFeatured: boolean) {
  const savedBlogs = await loadStoriesDirect();
  if (nextFeatured && getFeaturedCount(savedBlogs, id) >= 2) {
    throw new Error("Only 2 featured cards are allowed. Unfeature one saved card first.");
  }

  await patchRows("cities", new URLSearchParams({ id: `eq.${id}` }), {
    featured: nextFeatured,
    updated_at: new Date().toISOString()
  });
}

export async function toggleHomeVisibilityState(id: string, nextVisible: boolean) {
  await patchRows("cities", new URLSearchParams({ id: `eq.${id}` }), {
    show_on_home: nextVisible,
    pinned: nextVisible,
    updated_at: new Date().toISOString()
  });
}

export async function updateHomepageFilterTags(filterTags: string[]) {
  await upsertRows(
    "site_config",
    [
      {
        key: "homepage",
        filter_tags: [...new Set(filterTags.map((item) => slugify(item)).filter(Boolean))],
        updated_at: new Date().toISOString()
      }
    ],
    "key"
  );
}

export async function removeSavedCity(id: string, publishedBy: string) {
  await deleteRows("cities", new URLSearchParams({ id: `eq.${id}` }));
  await deleteRows("itineraries", new URLSearchParams({ city_id: `eq.${id}` }));
  await deleteRows("places", new URLSearchParams({ city_id: `eq.${id}` }));
  await publishRecommendationsFromCurrentData(publishedBy);
}

export async function clearGeneratedContent() {
  await deleteRows("recommendations", new URLSearchParams({ id: "not.is.null" }));
  await deleteRows("places", new URLSearchParams({ id: "not.is.null" }));
  await deleteRows("itineraries", new URLSearchParams({ id: "not.is.null" }));
  await deleteRows("cities", new URLSearchParams({ id: "not.is.null" }));
}

export function buildSavedResponse(stories: TravelBlog[]) {
  return sortPostsByCreatedAt(stories.map((story) => normalizeLoadedBlog(story)));
}
