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
  geo?: Record<string, unknown>;
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
const MIN_COORDINATE_DECIMALS = 6;

function toCamelCaseKey(value: string) {
  return value.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function countCoordinateDecimals(value: number) {
  const normalized = value.toString().toLowerCase();
  if (normalized.includes("e-")) {
    const [, exponent = "0"] = normalized.split("e-");
    return Number(exponent);
  }
  const [, fraction = ""] = normalized.split(".");
  return fraction.length;
}

function hasRequiredCoordinatePrecision(value: unknown) {
  if (typeof value === "number") {
    // Numeric coordinates lose trailing zeroes in JS, so once a point has been normalized
    // through our pipeline we should accept the finite numeric value as canonical.
    return Number.isFinite(value);
  }
  if (typeof value !== "string") return false;
  return countCoordinateDecimals(Number(value)) >= MIN_COORDINATE_DECIMALS || countCoordinateDecimals(Number.parseFloat(value)) >= MIN_COORDINATE_DECIMALS || String(value).split(".")[1]?.length >= MIN_COORDINATE_DECIMALS;
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

function normalizeGeoPoint(value: unknown) {
  const lat = Number((value as Record<string, unknown> | null)?.lat);
  const lng = Number((value as Record<string, unknown> | null)?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return undefined;
  return {
    lat: Number(lat.toFixed(MIN_COORDINATE_DECIMALS)),
    lng: Number(lng.toFixed(MIN_COORDINATE_DECIMALS))
  };
}

function formatCoordinateLabel(kind: string, label: string) {
  const normalizedKind = String(kind || "place");
  if (normalizedKind === "itinerary") return `itinerary spot "${label}"`;
  if (normalizedKind === "food") return `food spot "${label}"`;
  if (normalizedKind === "gem") return `hidden gem "${label}"`;
  return `${normalizedKind} "${label}"`;
}

function assertValidGeoPoint(value: unknown, label: string, { requireExactPrecision = true }: { requireExactPrecision?: boolean } = {}) {
  const point = normalizeGeoPoint(value);
  if (!point) {
    throw new Error(`Missing valid coordinates for ${label}. Every saved location must include real latitude and longitude values.`);
  }
  if (Math.abs(point.lat) < 0.000001 && Math.abs(point.lng) < 0.000001) {
    throw new Error(`Refusing to save placeholder coordinates for ${label}. Do not use 0,0 or empty fallback coordinates.`);
  }
  if (
    requireExactPrecision &&
    (!hasRequiredCoordinatePrecision((value as Record<string, unknown> | null)?.lat) || !hasRequiredCoordinatePrecision((value as Record<string, unknown> | null)?.lng))
  ) {
    throw new Error(`Coordinates for ${label} must use at least ${MIN_COORDINATE_DECIMALS} decimal places. Approximate 3-decimal coordinates are not allowed.`);
  }
  return point;
}

function normalizeSpotRef(value: unknown) {
  if (typeof value === "string") {
    const name = value.trim();
    return name ? name : null;
  }

  const place = normalizePlace((value || {}) as PlaceDraft, "itinerary");
  if (!place.name) return null;
  return place;
}

function normalizeItineraryDay(day: Record<string, unknown>) {
  const explicitSpots = ensureArray(day?.spots)
    .map(normalizeSpotRef)
    .filter((spot): spot is string | ReturnType<typeof normalizePlace> => Boolean(spot))
    .filter((spot, index, spots) => {
      const name = typeof spot === "string" ? spot : spot.name;
      const slug = slugify(name);
      return spots.findIndex((entry) => slugify(typeof entry === "string" ? entry : entry.name) === slug) === index;
    });
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
      geo: undefined,
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
    geo: normalizeGeoPoint(place.geo),
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
      geo: normalized.geo || existing?.geo || {},
      desc: normalized.desc || String(existing?.desc || ""),
      tip: normalized.tip || String(existing?.tip || ""),
      cuisine: normalized.cuisine || String(existing?.cuisine || ""),
      price: normalized.price || String(existing?.price || ""),
      image: normalized.image || String(existing?.image || "")
    });
    return {
      ...normalized,
      id: placeId,
      cityId,
      kind
    };
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

function assertCoordinateIntegrity(
  draft: BlogDraft,
  { requireExactPrecision = true }: { requireExactPrecision?: boolean } = {}
) {
  assertValidGeoPoint(draft.geo, `destination "${String(draft.city || "Untitled destination")}"`, { requireExactPrecision });

  const seenByPlaceSlug = new Map<string, { label: string; lat: number; lng: number }>();
  const registerPlace = (place: unknown, fallbackKind: string) => {
    const normalized = normalizePlace((place || {}) as PlaceDraft, fallbackKind);
    if (!normalized.name) return;

    const label = formatCoordinateLabel(fallbackKind, normalized.name);
    const geo = assertValidGeoPoint(normalized.geo, label, { requireExactPrecision });
    const slug = slugify(normalized.name);
    const previous = seenByPlaceSlug.get(slug);
    if (
      previous &&
      (Math.abs(previous.lat - geo.lat) > 0.000001 || Math.abs(previous.lng - geo.lng) > 0.000001)
    ) {
      throw new Error(
        `Conflicting coordinates detected for "${normalized.name}". ${previous.label} and ${label} must point to the same exact place.`
      );
    }
    seenByPlaceSlug.set(slug, { label, lat: geo.lat, lng: geo.lng });
  };

  ensureArray<Record<string, unknown>>(draft.itinerary).forEach((day) => {
    ensureArray(day?.spots).forEach((spot) => registerPlace(spot, "itinerary"));
  });
  ensureArray(draft.food).forEach((place) => registerPlace(place, "food"));
  ensureArray(draft.gems).forEach((place) => registerPlace(place, "gem"));
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

export async function saveStoryDraft(draft: BlogDraft, publishedBy: string) {
  const existingSaved = await loadStoriesDirect();
  assertItinerarySpots(ensureArray<Record<string, unknown>>(draft.itinerary).map(normalizeItineraryDay));
  assertCoordinateIntegrity(draft);
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
      id: place.id,
      city_id: place.city_id,
      city: place.city,
      country: place.country,
      slug: place.slug,
      name: place.name,
      kind: place.kind,
      kinds: place.kinds,
      geo: place.geo,
      desc: place.desc,
      tip: place.tip,
      cuisine: place.cuisine,
      price: place.price,
      image: place.image,
      created_at: draft.createdAt || now,
      updated_at: now,
      published_by: publishedBy
    })),
    "id"
  );

  const generatedRecommendations = await publishRecommendationsFromCurrentData(publishedBy);
  return {
    cityId,
    generatedRecommendations,
    savedDraft: draft
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
