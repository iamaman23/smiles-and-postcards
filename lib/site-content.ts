import { cache } from "react";
import { buildCityImageRoute, isGenericCityFallbackImage } from "./city-image-routes";
import { RECOMMENDATION_INTENTS, type RecommendationIntent } from "./recommendation-intents";
import { DEFAULT_REVALIDATE_SECONDS, FIREBASE_CONFIG } from "./site-config";

type FirestorePrimitive =
  | string
  | number
  | boolean
  | null
  | FirestorePrimitive[]
  | { [key: string]: FirestorePrimitive };

type FirestoreDocument = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: FirestorePrimitive | undefined;
};

export type PlaceEntity = {
  id: string;
  cityId: string;
  kind: string;
  name: string;
  desc: string;
  tip: string;
  cuisine: string;
  price: string;
  image: string;
};

export type BlogDay = {
  day: string;
  title: string;
  text: string;
  spots: string[];
  spotIds?: string[];
  spotDetails?: PlaceEntity[];
};

export type TravelBlog = {
  id: string;
  cityId: string;
  city: string;
  country: string;
  title: string;
  excerpt: string;
  image: string;
  heroImage?: string;
  featured?: boolean;
  days: number;
  budget?: string;
  bestSeason?: string;
  date?: string;
  tags: string[];
  travelStyles: string[];
  stats?: {
    days?: string;
    budget?: string;
    bestMonth?: string;
    walkScore?: string;
  };
  itinerary: BlogDay[];
  food: PlaceEntity[];
  gems: PlaceEntity[];
  highlights?: string[];
  budgetBreakdown?: Array<Record<string, string>>;
  scores?: Record<string, number>;
  experience?: {
    pace?: string;
    crowdLevel?: string;
    seasonality?: string;
    difficulty?: string;
  };
  meta?: {
    continent?: string;
    currency?: string;
    [key: string]: FirestorePrimitive | undefined;
  };
  finalScore?: number;
  createdAt?: string;
  recommendationProfile?: RecommendationProfile;
  showOnHome?: boolean;
  pinned?: boolean;
  warnings?: string[];
  skipIf?: string[];
};

type RecommendationProfile = {
  styles: string[];
  tags: string[];
  seasons: string[];
  continent: string;
  pace: string;
  budgetRange: string;
};

export type RecommendationDoc = {
  id: string;
  title: string;
  description: string;
  filters: Record<string, unknown>;
  ranking: Record<string, unknown>;
  cityIds: string[];
  rankedCities: Array<{
    cityId: string;
    score: number;
    rank: number;
    finalScore: number;
    days: number;
  }>;
  resultCount: number;
  coverCityId: string;
};

const CONTINENT_ALIASES: Record<string, string> = {
  africa: "africa",
  antarctica: "antarctica",
  asia: "asia",
  europe: "europe",
  oceania: "oceania",
  australia: "oceania",
  "north-america": "north-america",
  "south-america": "south-america"
};

const COUNTRY_TO_CONTINENT: Record<string, string> = {
  india: "asia",
  japan: "asia",
  thailand: "asia",
  indonesia: "asia",
  vietnam: "asia",
  singapore: "asia",
  malaysia: "asia",
  china: "asia",
  nepal: "asia",
  "sri-lanka": "asia",
  uae: "asia",
  netherlands: "europe",
  "czech-republic": "europe",
  czechia: "europe",
  france: "europe",
  italy: "europe",
  spain: "europe",
  portugal: "europe",
  germany: "europe",
  austria: "europe",
  greece: "europe",
  switzerland: "europe",
  belgium: "europe",
  croatia: "europe",
  "united-kingdom": "europe",
  uk: "europe",
  ireland: "europe",
  norway: "europe",
  sweden: "europe",
  finland: "europe",
  denmark: "europe",
  usa: "north-america",
  "united-states": "north-america",
  canada: "north-america",
  mexico: "north-america",
  brazil: "south-america",
  peru: "south-america",
  argentina: "south-america",
  chile: "south-america",
  colombia: "south-america",
  morocco: "africa",
  egypt: "africa",
  "south-africa": "africa",
  kenya: "africa",
  tanzania: "africa",
  australia: "oceania",
  "new-zealand": "oceania"
};

const RECOMMENDATION_STYLE_KEYWORDS: Record<string, string[]> = {
  budget: ["budget", "affordable", "cheap", "value", "backpacking", "hostel"],
  backpacking: ["backpacking", "backpacker", "hostel", "budget"],
  foodie: ["foodie", "food", "culinary", "street-food", "gastronomy"],
  romantic: ["romantic", "honeymoon", "couples", "date-night"],
  solo: ["solo", "solo-travel", "independent"],
  family: ["family", "kid-friendly", "kids", "family-friendly"],
  party: ["party", "nightlife", "clubs", "bar-hopping"],
  cultural: ["cultural", "culture", "museum", "heritage", "historic", "history"],
  digital_nomad: ["digital-nomad", "digital_nomad", "remote-work", "coworking", "wifi"],
  luxury: ["luxury", "boutique", "five-star", "fine-dining", "premium"]
};

const RECOMMENDATION_TAG_KEYWORDS: Record<string, string[]> = {
  architecture: ["architecture", "architectural", "design"],
  coastal: ["coastal", "seaside", "waterfront", "beach", "island"],
  mountains: ["mountains", "mountain", "alpine", "ski"],
  offbeat: ["offbeat", "underrated", "alternative"],
  hidden_gems: ["hidden-gems", "hidden_gems", "secret-spots", "local-favorite"],
  history: ["history", "historic", "heritage", "ancient"],
  photography: ["photography", "photo", "instagrammable", "picturesque"],
  scenic: ["scenic", "views", "viewpoints", "landscape"],
  winter: ["winter", "snow", "snowy"],
  christmas: ["christmas", "markets", "festive"],
  autumn: ["autumn", "fall", "foliage"],
  nature: ["nature", "hiking", "outdoors", "lakes", "parks"],
  weekend: ["weekend", "city-break", "citybreak", "short-break"],
  first_time: ["first-time", "first_time", "easy", "starter"],
  winter_sun: ["winter-sun", "winter_sun", "warm-winter", "sunny-winter"]
};

const MONTH_TO_SEASON: Record<string, string> = {
  jan: "winter",
  feb: "winter",
  mar: "spring",
  apr: "spring",
  may: "spring",
  jun: "summer",
  jul: "summer",
  aug: "summer",
  sep: "autumn",
  oct: "autumn",
  nov: "autumn",
  dec: "winter"
};

function slugify(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugifyOptional(value: unknown) {
  return slugify(value || "");
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function slugifyList(values: unknown) {
  return ensureArray<string>(values).map(slugify).filter(Boolean);
}

function parseFirestoreValue(value: any): FirestorePrimitive {
  if (!value || typeof value !== "object") return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("geoPointValue" in value) {
    return {
      lat: Number(value.geoPointValue.latitude || 0),
      lng: Number(value.geoPointValue.longitude || 0)
    };
  }
  if ("mapValue" in value) {
    const fields = value.mapValue?.fields || {};
    return Object.fromEntries(
      Object.entries(fields).map(([key, nested]) => [key, parseFirestoreValue(nested)])
    );
  }
  if ("arrayValue" in value) {
    return ensureArray(value.arrayValue?.values).map(parseFirestoreValue);
  }
  return null;
}

function parseFirestoreDocument(document: any): FirestoreDocument {
  const rawFields = document?.fields || {};
  const fields = Object.fromEntries(
    Object.entries(rawFields).map(([key, value]) => [key, parseFirestoreValue(value)])
  );
  return {
    id: String(document?.name || "").split("/").pop() || "",
    createdAt: document?.createTime,
    updatedAt: document?.updateTime,
    ...fields
  };
}

async function fetchCollectionPage(collection: string, pageToken?: string) {
  const params = new URLSearchParams({ key: FIREBASE_CONFIG.apiKey });
  if (pageToken) params.set("pageToken", pageToken);
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/${collection}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: {
        revalidate: DEFAULT_REVALIDATE_SECONDS,
        tags: [`firestore:${collection}`, "firestore:content"]
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          documents: [] as FirestoreDocument[],
          nextPageToken: ""
        };
      }
      throw new Error(`Firestore request failed for ${collection}: ${response.status}`);
    }

    const payload = await response.json();
    return {
      documents: ensureArray(payload.documents).map(parseFirestoreDocument),
      nextPageToken: String(payload.nextPageToken || "")
    };
  } catch (error) {
    console.warn(`Unable to load Firestore collection "${collection}".`, error);
    return {
      documents: [] as FirestoreDocument[],
      nextPageToken: ""
    };
  }
}

async function fetchCollection(collection: string) {
  const documents: FirestoreDocument[] = [];
  let pageToken = "";

  do {
    const page = await fetchCollectionPage(collection, pageToken || undefined);
    documents.push(...page.documents);
    pageToken = page.nextPageToken;
  } while (pageToken);

  return documents;
}

function mergePlaceEntities(primary: PlaceEntity | null, fallback: PlaceEntity | null) {
  if (!primary) return fallback;
  if (!fallback) return primary;
  return {
    ...fallback,
    ...primary,
    id: primary.id || fallback.id,
    cityId: primary.cityId || fallback.cityId,
    kind: primary.kind || fallback.kind,
    name: primary.name || fallback.name,
    desc: primary.desc || fallback.desc,
    tip: primary.tip || fallback.tip,
    cuisine: primary.cuisine || fallback.cuisine,
    price: primary.price || fallback.price,
    image: primary.image || fallback.image
  };
}

function getPlaceAliasKeys(place: FirestoreDocument, normalized: PlaceEntity | null) {
  return [
    ...getPlaceLookupKeys(place.id),
    ...getPlaceLookupKeys(normalized?.id),
    ...getPlaceLookupKeys(place.slug),
    ...getPlaceLookupKeys(normalized?.name)
  ];
}

function chooseRicherPlaceEntity(current: PlaceEntity | null, incoming: PlaceEntity | null) {
  if (!current) return incoming;
  if (!incoming) return current;
  const currentScore = [current.desc, current.tip, current.cuisine, current.price, current.image].filter(Boolean).length;
  const incomingScore = [incoming.desc, incoming.tip, incoming.cuisine, incoming.price, incoming.image].filter(Boolean).length;
  return mergePlaceEntities(incomingScore >= currentScore ? incoming : current, incomingScore >= currentScore ? current : incoming);
}

function fillPlaceEntityDefaults(place: PlaceEntity | null, fallbackKind: string) {
  if (!place) return null;
  return {
    ...place,
    kind: place.kind || fallbackKind,
    desc: place.desc || "",
    tip: place.tip || "",
    cuisine: place.cuisine || "",
    price: place.price || "",
    image: place.image || ""
  }
}

function normalizeContinentValue(value: unknown) {
  return CONTINENT_ALIASES[slugify(value)] || "";
}

function inferContinentTag(country: unknown, tags: unknown, city: unknown, explicitContinent: unknown) {
  const explicit = normalizeContinentValue(explicitContinent);
  if (explicit) return explicit;
  const existing = ensureArray<string>(tags).map(slugify).find((tag) => Object.values(CONTINENT_ALIASES).includes(tag));
  if (existing) return existing;
  return COUNTRY_TO_CONTINENT[slugify(country)] || COUNTRY_TO_CONTINENT[slugify(city)] || "";
}

function normalizeTags(country: unknown, rawTags: unknown, city: unknown, explicitContinent: unknown) {
  const tags = ensureArray<string>(rawTags).map(slugify).filter(Boolean);
  const unique = [...new Set(tags)];
  const continent = inferContinentTag(country, unique, city, explicitContinent);
  if (continent && !unique.includes(continent)) unique.unshift(continent);
  return unique;
}

function formatWalkScore(value: unknown) {
  const raw = String(value || "").trim();
  const match = raw.match(/\d+/);
  if (!match) return "80/100";
  const numeric = Math.max(0, Math.min(100, Number(match[0])));
  return `${numeric}/100`;
}

function clampScore(value: unknown, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.min(10, numeric));
}

function computeMatchToTravelStyle(travelStyles: unknown) {
  const count = ensureArray(travelStyles).length;
  return Math.max(6, Math.min(10, 5 + count));
}

function computeFinalScore(scores: Record<string, unknown> | undefined, travelStyles: unknown) {
  const safeScores = scores || {};
  const finalScore =
    clampScore(safeScores.walkability, 7) * 0.15 +
    clampScore(safeScores.food, 8) * 0.2 +
    clampScore(safeScores.safety, 7) * 0.15 +
    clampScore(safeScores.culture, 8) * 0.15 +
    clampScore(safeScores.affordability, 7) * 0.15 +
    computeMatchToTravelStyle(travelStyles) * 0.2;
  return Number(finalScore.toFixed(2));
}

function parseBudgetValue(budget: unknown) {
  const raw = String(budget || "").replace(/,/g, "");
  const match = raw.match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

export function getBudgetRange(value: number | null) {
  if (value == null) return "unknown";
  if (value < 50) return "budget";
  if (value <= 120) return "mid";
  return "luxury";
}

export function getBudgetTier(blog: TravelBlog) {
  const range = getBudgetRange(parseBudgetValue(blog.budget));
  if (range === "budget") return "$";
  if (range === "mid") return "$$";
  if (range === "luxury") return "$$$";
  const affordability = clampScore(blog?.scores?.affordability, 7);
  if (affordability >= 8) return "$";
  if (affordability >= 6) return "$$";
  return "$$$";
}

export function getDestinationPath(blog: TravelBlog) {
  return `/destination/${slugify(blog.country)}/${slugify(blog.city)}`;
}

export function getScoreLabel(score: number) {
  if (score >= 9) return "Excellent";
  if (score >= 8) return "High";
  if (score >= 6.5) return "Moderate";
  if (score >= 5) return "Mixed";
  return "Low";
}

export function getSnapshotSummary(blog: TravelBlog) {
  const scores = blog?.scores || {};
  return [
    { label: "Walkability", value: getScoreLabel(clampScore(scores.walkability, 7)) },
    { label: "Food", value: getScoreLabel(clampScore(scores.food, 8)) },
    { label: "Safety", value: getScoreLabel(clampScore(scores.safety, 7)) },
    { label: "Affordability", value: getScoreLabel(clampScore(scores.affordability, 7)) }
  ];
}

export function getBreakdownScores(blog: TravelBlog) {
  const scores = blog?.scores || {};
  return [
    ["Walkability", clampScore(scores.walkability, 7)],
    ["Food", clampScore(scores.food, 8)],
    ["Safety", clampScore(scores.safety, 7)],
    ["Affordability", clampScore(scores.affordability, 7)],
    ["Culture", clampScore(scores.culture, 8)],
    ["Nightlife", clampScore(scores.nightlife, 6)]
  ] as const;
}

export function getVibeIndicator(blog: TravelBlog) {
  const finalScore = Number(blog?.finalScore) || 0;
  const scores = blog?.scores || {};
  if (finalScore >= 8.6 && clampScore(scores.affordability, 7) <= 6) return "Luxury Escape";
  if (clampScore(scores.nightlife, 6) >= 8 && blog?.experience?.pace === "fast") return "Fast-Paced City Break";
  if (clampScore(scores.culture, 8) >= 8 && clampScore(scores.walkability, 7) >= 7) return "Chill and Cultural";
  if (clampScore(scores.nature, 6) >= 8) return "Scenic Slow Reset";
  if (clampScore(scores.affordability, 7) >= 8 && clampScore(scores.food, 8) >= 8) return "Budget Foodie Adventure";
  if (clampScore(scores.safety, 7) >= 8 && clampScore(scores.familyFriendly, 7) >= 8) return "Easygoing Family Escape";
  return finalScore >= 8 ? "Well-Rounded City Escape" : "Curious Urban Detour";
}

function normalizeLoadedBlog(blog: Record<string, any>): TravelBlog {
  const normalizedScores = {
    walkability: clampScore(blog?.scores?.walkability, 7),
    affordability: clampScore(blog?.scores?.affordability, 7),
    safety: clampScore(blog?.scores?.safety, 7),
    nightlife: clampScore(blog?.scores?.nightlife, 6),
    food: clampScore(blog?.scores?.food, 8),
    culture: clampScore(blog?.scores?.culture, 8),
    nature: clampScore(blog?.scores?.nature, 6),
    connectivity: clampScore(blog?.scores?.connectivity, 7),
    familyFriendly: clampScore(blog?.scores?.familyFriendly, 7)
  };

  const fallbackCardImage = buildCityImageRoute(blog.city, blog.country, "card");
  const fallbackHeroImage = buildCityImageRoute(blog.city, blog.country, "hero");
  const image = String(blog.image || "");
  const heroImage = String(blog.heroImage || blog.image || "");
  const useFallbackCardImage = !image || isGenericCityFallbackImage(image) || (!image.startsWith("http") && !image.startsWith("/"));
  const useFallbackHeroImage = !heroImage || isGenericCityFallbackImage(heroImage) || (!heroImage.startsWith("http") && !heroImage.startsWith("/"));

  const normalized: TravelBlog = {
    ...blog,
    id: String(blog.id || blog.cityId || ""),
    cityId: String(blog.cityId || blog.id || ""),
    city: String(blog.city || ""),
    country: String(blog.country || ""),
    title: String(blog.title || ""),
    excerpt: String(blog.excerpt || ""),
    image: useFallbackCardImage ? fallbackCardImage : image,
    heroImage: useFallbackHeroImage ? fallbackHeroImage : heroImage,
    days: Number(blog.days || 3),
    tags: normalizeTags(blog.country, blog.tags, blog.city, blog?.meta?.continent),
    travelStyles: ensureArray<string>(blog.travelStyles).map(slugify),
    itinerary: ensureArray<BlogDay>(blog.itinerary),
    food: ensureArray<PlaceEntity>(blog.food),
    gems: ensureArray<PlaceEntity>(blog.gems),
    highlights: ensureArray<string>(blog.highlights).map(String).filter(Boolean),
    stats: blog.stats
      ? {
          ...blog.stats,
          walkScore: formatWalkScore(blog.stats.walkScore)
        }
      : undefined,
    meta: {
      ...(blog.meta || {}),
      continent:
        normalizeContinentValue(blog?.meta?.continent) ||
        inferContinentTag(blog.country, blog.tags, blog.city, blog?.meta?.continent) ||
        "",
      currency: String(blog?.meta?.currency || "USD")
    },
    scores: normalizedScores,
    experience: {
      pace: String(blog?.experience?.pace || "moderate"),
      crowdLevel: String(blog?.experience?.crowdLevel || "medium"),
      seasonality: String(blog?.experience?.seasonality || "stable"),
      difficulty: String(blog?.experience?.difficulty || "easy")
    },
    finalScore: Number.isFinite(Number(blog.finalScore))
      ? Number(blog.finalScore)
      : computeFinalScore(normalizedScores, blog.travelStyles),
    createdAt: String(blog.createdAt || ""),
    warnings: ensureArray<string>(blog.warnings).map(String).filter(Boolean),
    skipIf: ensureArray<string>(blog.skipIf).map(String).filter(Boolean)
  };

  normalized.showOnHome = blog.showOnHome !== false && blog.pinned !== false;
  normalized.pinned = blog.showOnHome !== false && blog.pinned !== false;
  normalized.recommendationProfile = deriveRecommendationProfile(normalized);
  return normalized;
}

function normalizePlaceEntity(place: any, fallbackKind = "place"): PlaceEntity | null {
  if (!place) return null;
  if (typeof place === "string") {
    if (fallbackKind !== "itinerary" && isLikelyPlaceId(place)) return null;
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
    name: String(place.name || place.title || place.label || ""),
    desc: String(place.desc || place.description || place.text || ""),
    tip: String(place.tip || ""),
    cuisine: String(place.cuisine || ""),
    price: String(place.price || ""),
    image: String(place.image || "")
  };
}

function isLikelyPlaceId(value: string) {
  const raw = value.trim();
  return /^[a-z0-9_-]{8,}$/i.test(raw) && !/\s/.test(raw);
}

function extractPlaceSlug(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const match = raw.match(/(?:^|-)place-(.+)$/i);
  return slugify(match?.[1] || raw);
}

function extractPlaceCityId(value: unknown) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(.*?)-place-/i);
  return String(match?.[1] || "");
}

function formatPlaceNameFromSlug(value: unknown) {
  const slug = extractPlaceSlug(value);
  if (!slug) return "";
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPlaceLookupKeys(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return [];
  const slug = slugify(raw);
  const placeSlug = extractPlaceSlug(raw);
  return [...new Set([raw, slug, placeSlug].filter(Boolean))];
}

function buildFallbackPlaceFromRef(ref: string, fallbackKind: string) {
  const name = formatPlaceNameFromSlug(ref);
  if (!name) return null;
  return {
    id: ref,
    cityId: extractPlaceCityId(ref),
    kind: fallbackKind,
    name,
    desc: "",
    tip: "",
    cuisine: "",
    price: "",
    image: ""
  } satisfies PlaceEntity;
}

function buildPlacesById(places: FirestoreDocument[]) {
  const map = new Map<string, PlaceEntity | null>();
  places.forEach((place) => {
    const normalized = normalizePlaceEntity(place, String(place.kind || "place"));
    getPlaceAliasKeys(place, normalized).forEach((key) => {
      const current = map.get(String(key)) || null;
      const richer = chooseRicherPlaceEntity(current, normalized);
      map.set(String(key), fillPlaceEntityDefaults(richer, String(place.kind || normalized?.kind || "place")));
    });
  });
  return map;
}

function buildPlacesByCityAndKind(places: FirestoreDocument[]) {
  const map = new Map<string, PlaceEntity[]>();
  places.forEach((place) => {
    const normalized = normalizePlaceEntity(place, String(place.kind || "place"));
    if (!normalized?.name) return;
    const cityId = String(place.cityId || normalized.cityId || "").trim();
    const kind = slugify(place.kind || normalized.kind || "");
    if (!cityId || !kind) return;
    const key = `${cityId}::${kind}`;
    map.set(key, [...(map.get(key) || []), normalized]);
  });
  return map;
}

function resolvePlaceRefs(refs: unknown, placesById: Map<string, PlaceEntity | null>, fallbackKind: string) {
  return ensureArray(refs)
    .map((ref) => {
      if (typeof ref === "string") {
        const directMatch = getPlaceLookupKeys(ref)
          .map((key) => placesById.get(key))
          .find(Boolean);
        if (directMatch) return fillPlaceEntityDefaults(directMatch, fallbackKind);
        if (isLikelyPlaceId(ref) || extractPlaceSlug(ref) !== slugify(ref)) {
          return buildFallbackPlaceFromRef(ref, fallbackKind);
        }
      }
      return fillPlaceEntityDefaults(normalizePlaceEntity(ref, fallbackKind), fallbackKind);
    })
    .filter((place): place is PlaceEntity => Boolean(place?.name));
}

function resolvePlaceRefsWithFallback(
  primaryRefs: unknown,
  fallbackRefs: unknown,
  placesById: Map<string, PlaceEntity | null>,
  fallbackKind: string
) {
  const primary = resolvePlaceRefs(primaryRefs, placesById, fallbackKind);
  if (primary.length) return primary;
  return resolvePlaceRefs(fallbackRefs, placesById, fallbackKind);
}

function getPlacesForCityAndKind(
  cityId: string,
  kind: string,
  placesByCityAndKind: Map<string, PlaceEntity[]>
) {
  return placesByCityAndKind.get(`${cityId}::${slugify(kind)}`) || [];
}

function resolveItineraryDays(itinerary: unknown, placesById: Map<string, PlaceEntity | null>) {
  return ensureArray<any>(itinerary).map((day) => {
    const resolvedSpots = resolvePlaceRefs(day?.spots, placesById, "itinerary");
    return {
      ...day,
      day: String(day?.day || ""),
      title: String(day?.title || ""),
      text: String(day?.text || ""),
      spots: resolvedSpots.map((place) => place.name),
      spotIds: resolvedSpots.map((place) => place.id).filter(Boolean),
      spotDetails: resolvedSpots
    } satisfies BlogDay;
  });
}

function getPostSortTime(post: Record<string, any>) {
  const value = post?.createdAt;
  if (!value) return 0;
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortPostsByCreatedAt(posts: TravelBlog[]) {
  return [...posts].sort((a, b) => getPostSortTime(b) - getPostSortTime(a));
}

function combineCityAndItinerary(
  cityDoc: FirestoreDocument,
  itineraryDoc: FirestoreDocument | undefined,
  placesById: Map<string, PlaceEntity | null>,
  placesByCityAndKind: Map<string, PlaceEntity[]>
) {
  const cityData = (cityDoc || {}) as Record<string, any>;
  const itineraryData = (itineraryDoc || {}) as Record<string, any>;
  const cityId = cityDoc.id || String(cityData.id || itineraryData.cityId || "");
  const resolvedFood = resolvePlaceRefsWithFallback(itineraryData.food, cityData.food, placesById, "food");
  const resolvedGems = resolvePlaceRefsWithFallback(itineraryData.gems, cityData.gems, placesById, "gem");

  return normalizeLoadedBlog({
    ...cityData,
    id: cityId,
    cityId,
    days: itineraryData.days ?? cityData.days ?? 3,
    travelStyles: itineraryData.travelStyles || cityData.travelStyles || [],
    itinerary: resolveItineraryDays(itineraryData.itinerary || cityData.itinerary || [], placesById),
    food: resolvedFood.length ? resolvedFood : getPlacesForCityAndKind(cityId, "food", placesByCityAndKind),
    gems: resolvedGems.length ? resolvedGems : getPlacesForCityAndKind(cityId, "gem", placesByCityAndKind)
  });
}

function buildStructuredBlogs(
  cities: FirestoreDocument[],
  itineraries: FirestoreDocument[],
  places: FirestoreDocument[]
) {
  const itineraryByCityId = new Map<string, FirestoreDocument>();
  const placesById = buildPlacesById(places);
  const placesByCityAndKind = buildPlacesByCityAndKind(places);

  itineraries.forEach((doc) => {
    const cityId = String(doc.cityId || "");
    if (!cityId) return;
    const previous = itineraryByCityId.get(cityId);
    if (!previous || getPostSortTime(doc) >= getPostSortTime(previous)) {
      itineraryByCityId.set(cityId, doc);
    }
  });

  return cities.map((cityDoc) =>
    combineCityAndItinerary(cityDoc, itineraryByCityId.get(cityDoc.id), placesById, placesByCityAndKind)
  );
}

function getCityLookupKeys(blog: TravelBlog) {
  return [...new Set([slugify(blog.cityId), slugify(blog.id), slugify(blog.city), slugify(`${blog.city}-${blog.country}`)].filter(Boolean))];
}

function mergeBlogCollections(primaryBlogs: TravelBlog[], secondaryBlogs: TravelBlog[]) {
  const merged: TravelBlog[] = [];
  const seen = new Set<string>();

  [...primaryBlogs, ...secondaryBlogs].forEach((blog) => {
    const keys = getCityLookupKeys(blog);
    if (!keys.length || keys.some((key) => seen.has(key))) return;
    keys.forEach((key) => seen.add(key));
    merged.push(blog);
  });

  return sortPostsByCreatedAt(merged);
}

function buildRecommendationCanonicalMap(dictionary: Record<string, string[]>) {
  const map = new Map<string, string>();
  Object.entries(dictionary).forEach(([canonical, keywords]) => {
    [canonical, ...keywords].forEach((keyword) => {
      const normalized = slugify(keyword);
      if (normalized) map.set(normalized, canonical);
    });
  });
  return map;
}

const RECOMMENDATION_STYLE_CANONICAL_MAP = buildRecommendationCanonicalMap(RECOMMENDATION_STYLE_KEYWORDS);
const RECOMMENDATION_TAG_CANONICAL_MAP = buildRecommendationCanonicalMap(RECOMMENDATION_TAG_KEYWORDS);

function canonicalizeRecommendationTerms(values: unknown, canonicalMap: Map<string, string>) {
  return [...new Set(slugifyList(values).map((value) => canonicalMap.get(value) || value))];
}

function collectRecommendationMatches(sourceTerms: Set<string>, dictionary: Record<string, string[]>) {
  const matches = new Set<string>();
  Object.entries(dictionary).forEach(([canonical, keywords]) => {
    const variants = [canonical, ...keywords].map(slugify);
    if (variants.some((keyword) => sourceTerms.has(keyword))) matches.add(canonical);
  });
  return matches;
}

function getRecommendationSourceTerms(blog: TravelBlog) {
  return new Set([
    ...slugifyList(blog.travelStyles),
    ...slugifyList(blog.tags),
    ...String(blog.title || "").toLowerCase().split(/\s+/).map(slugify),
    ...String(blog.excerpt || "").toLowerCase().split(/\s+/).map(slugify),
    slugify(blog.city),
    slugify(blog.country)
  ]);
}

function deriveSeasonTokens(bestSeason: unknown) {
  const raw = String(bestSeason || "").toLowerCase();
  const tokens = new Set(raw.split(/[^a-z]+/g).map(slugify).filter(Boolean));
  Object.entries(MONTH_TO_SEASON).forEach(([month, season]) => {
    if (raw.includes(month)) tokens.add(season);
  });
  return [...tokens];
}

function deriveRecommendationProfile(blog: TravelBlog): RecommendationProfile {
  const sourceTerms = getRecommendationSourceTerms(blog);
  const scores = blog?.scores || {};
  const styles = new Set(canonicalizeRecommendationTerms(blog.travelStyles, RECOMMENDATION_STYLE_CANONICAL_MAP));
  const tags = new Set(canonicalizeRecommendationTerms(blog.tags, RECOMMENDATION_TAG_CANONICAL_MAP));
  const seasons = new Set(deriveSeasonTokens(blog.bestSeason));
  const continent = slugify(blog?.meta?.continent);

  collectRecommendationMatches(sourceTerms, RECOMMENDATION_STYLE_KEYWORDS).forEach((style) => styles.add(style));
  collectRecommendationMatches(sourceTerms, RECOMMENDATION_TAG_KEYWORDS).forEach((tag) => tags.add(tag));

  if (clampScore(scores.affordability, 0) >= 8) styles.add("budget");
  if (clampScore(scores.affordability, 0) >= 8) styles.add("backpacking");
  if (clampScore(scores.food, 0) >= 8) styles.add("foodie");
  if (clampScore(scores.culture, 0) >= 8) styles.add("cultural");
  if (clampScore(scores.culture, 0) >= 8) tags.add("history");
  if (clampScore(scores.nightlife, 0) >= 8) styles.add("party");
  if (clampScore(scores.familyFriendly, 0) >= 8) styles.add("family");
  if (clampScore(scores.nature, 0) >= 8) tags.add("nature");
  if (clampScore(scores.walkability, 0) >= 8) tags.add("citybreak");
  if (clampScore(scores.affordability, 0) <= 5 && Number(blog.finalScore || 0) >= 8) styles.add("luxury");
  if (slugifyOptional(blog?.experience?.pace) === "relaxed") tags.add("slow-travel");
  if (slugifyOptional(blog?.experience?.pace) === "fast") tags.add("high-energy");
  if (continent) tags.add(continent);

  return {
    styles: [...styles],
    tags: [...tags],
    seasons: [...seasons],
    continent,
    pace: slugifyOptional(blog?.experience?.pace),
    budgetRange: getBudgetRange(parseBudgetValue(blog?.budget))
  };
}

function matchesRecommendationFilters(blog: TravelBlog, filters: Record<string, any> = {}) {
  const profile = blog.recommendationProfile || deriveRecommendationProfile(blog);
  const profileStyles = new Set(canonicalizeRecommendationTerms(profile.styles, RECOMMENDATION_STYLE_CANONICAL_MAP));
  const profileTags = new Set(canonicalizeRecommendationTerms(profile.tags, RECOMMENDATION_TAG_CANONICAL_MAP));
  const profileSeasons = new Set(slugifyList(profile.seasons));
  const targetContinent = slugifyOptional(filters.continent);
  if (targetContinent && profile.continent !== targetContinent) return false;

  const targetSeason = slugifyOptional(filters.bestSeason);
  if (targetSeason && !profileSeasons.has(targetSeason)) return false;

  const targetStyles = canonicalizeRecommendationTerms(filters.travelStyles, RECOMMENDATION_STYLE_CANONICAL_MAP);
  if (targetStyles.length && !targetStyles.some((style) => profileStyles.has(style) || profileTags.has(style))) {
    return false;
  }

  const targetTags = canonicalizeRecommendationTerms(filters.tags, RECOMMENDATION_TAG_CANONICAL_MAP);
  if (targetTags.length && !targetTags.every((tag) => profileTags.has(tag) || profileStyles.has(tag))) {
    return false;
  }

  const targetExperience = filters.experience || {};
  if (
    Object.entries(targetExperience).some(
      ([key, value]) => slugifyOptional(blog?.experience?.[key as keyof TravelBlog["experience"]]) !== slugifyOptional(value)
    )
  ) {
    return false;
  }

  const targetScores = filters.scores || {};
  if (Object.entries(targetScores).some(([key, value]) => clampScore(blog?.scores?.[key], 0) < Number(value))) {
    return false;
  }

  return true;
}

function scoreRecommendationCandidate(blog: TravelBlog, intent: RecommendationIntent) {
  const filters = (intent.filters || {}) as Record<string, any>;
  const ranking = (intent.ranking || {}) as Record<string, any>;
  const profile = blog.recommendationProfile || deriveRecommendationProfile(blog);
  const targetStyles = canonicalizeRecommendationTerms(filters.travelStyles, RECOMMENDATION_STYLE_CANONICAL_MAP);
  const targetTags = canonicalizeRecommendationTerms(filters.tags, RECOMMENDATION_TAG_CANONICAL_MAP);
  const blogStyles = new Set(canonicalizeRecommendationTerms(profile.styles, RECOMMENDATION_STYLE_CANONICAL_MAP));
  const blogTags = new Set(canonicalizeRecommendationTerms(profile.tags, RECOMMENDATION_TAG_CANONICAL_MAP));
  const profileSeasons = new Set(slugifyList(profile.seasons));
  const styleMatches = targetStyles.filter((style) => blogStyles.has(style) || blogTags.has(style)).length;
  const tagMatches = targetTags.filter((tag) => blogTags.has(tag) || blogStyles.has(tag)).length;
  const targetScores = filters.scores || {};
  let score = Number(blog.finalScore || 0) * 10;

  if (targetStyles.length) score += (styleMatches / targetStyles.length) * 20;
  if (targetTags.length) score += (tagMatches / targetTags.length) * 16;

  Object.entries(targetScores).forEach(([key, value]) => {
    const cityScore = clampScore(blog?.scores?.[key], 0);
    const targetValue = Number(value);
    score += cityScore >= targetValue ? 12 + Math.min(4, cityScore - targetValue) : Math.max(-8, (cityScore - targetValue) * 3);
  });

  if (filters.continent && profile.continent === slugifyOptional(filters.continent)) score += 6;
  if (filters.bestSeason && profileSeasons.has(slugifyOptional(filters.bestSeason))) score += 6;

  Object.entries(filters.experience || {}).forEach(([key, value]) => {
    if (slugifyOptional(blog?.experience?.[key as keyof TravelBlog["experience"]]) === slugifyOptional(value)) {
      score += 6;
    }
  });

  Object.entries(ranking.scoreWeights || {}).forEach(([key, weight]) => {
    const numericWeight = Number(weight) || 0;
    if (!numericWeight) return;
    if (key === "finalScore") {
      score += Number(blog.finalScore || 0) * numericWeight;
      return;
    }
    score += clampScore(blog?.scores?.[key], 0) * numericWeight;
  });

  canonicalizeRecommendationTerms(ranking.boostTravelStyles, RECOMMENDATION_STYLE_CANONICAL_MAP).forEach((style) => {
    if (blogStyles.has(style) || blogTags.has(style)) score += 8;
  });
  canonicalizeRecommendationTerms(ranking.boostTags, RECOMMENDATION_TAG_CANONICAL_MAP).forEach((tag) => {
    if (blogTags.has(tag) || blogStyles.has(tag)) score += 6;
  });

  if (ranking.preferBudgetRange && profile.budgetRange === slugifyOptional(ranking.preferBudgetRange)) score += 8;
  if (ranking.preferPace && slugifyOptional(blog?.experience?.pace) === slugifyOptional(ranking.preferPace)) score += 8;
  if (ranking.preferSeason && profileSeasons.has(slugifyOptional(ranking.preferSeason))) score += 8;
  if (ranking.preferContinent && profile.continent === slugifyOptional(ranking.preferContinent)) score += 4;

  return Number(score.toFixed(2));
}

function buildRecommendationDescription(intent: RecommendationIntent) {
  const filters = (intent.filters || {}) as Record<string, any>;
  const parts: string[] = [];
  if (filters.continent) parts.push(String(filters.continent));
  if (ensureArray<string>(filters.travelStyles).length) {
    parts.push(ensureArray<string>(filters.travelStyles).map((value) => value.replace(/_/g, " ")).join(", "));
  }
  if (ensureArray<string>(filters.tags).length) {
    parts.push(ensureArray<string>(filters.tags).map((value) => value.replace(/_/g, " ")).join(", "));
  }
  if (filters.bestSeason) parts.push(`${filters.bestSeason} trips`);
  if (filters.experience?.pace) parts.push(`${filters.experience.pace} pace`);
  if (filters.scores && Object.keys(filters.scores).length) {
    parts.push(Object.entries(filters.scores).map(([key, value]) => `${key} ${value}+`).join(", "));
  }
  return parts.length ? `Ranked from ${parts.join(" • ")}.` : "Ranked from the saved destination dataset.";
}

function buildRecommendationDocument(intent: RecommendationIntent, blogs: TravelBlog[]) {
  const filteredBlogs = blogs.filter((blog) => matchesRecommendationFilters(blog, (intent.filters || {}) as Record<string, any>));
  const limit = Number((intent.ranking as Record<string, unknown> | undefined)?.limit || 10);

  const ranked = filteredBlogs
    .map((blog) => ({
      blog,
      cityId: blog.cityId || blog.id || slugify(blog.city),
      score: scoreRecommendationCandidate(blog, intent)
    }))
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : Number(b.blog.finalScore || 0) - Number(a.blog.finalScore || 0)))
    .slice(0, Number.isFinite(limit) && limit > 0 ? limit : 10);

  return {
    id: intent.id,
    title: intent.title,
    description: buildRecommendationDescription(intent),
    filters: (intent.filters || {}) as Record<string, unknown>,
    ranking: (intent.ranking || {}) as Record<string, unknown>,
    cityIds: ranked.map((item) => item.cityId),
    rankedCities: ranked.map((item, index) => ({
      cityId: item.cityId,
      score: item.score,
      rank: index + 1,
      finalScore: Number(item.blog.finalScore || 0),
      days: Number(item.blog.days || 0)
    })),
    resultCount: ranked.length,
    coverCityId: ranked[0]?.cityId || ""
  } satisfies RecommendationDoc;
}

function normalizeRecommendationDoc(raw: Record<string, any>) {
  return {
    id: String(raw.id || slugify(raw.title)),
    title: String(raw.title || "Recommendation Set"),
    description: String(raw.description || buildRecommendationDescription(raw as RecommendationIntent)),
    filters: (raw.filters || {}) as Record<string, unknown>,
    ranking: (raw.ranking || {}) as Record<string, unknown>,
    cityIds: ensureArray<string>(raw.cityIds),
    rankedCities: ensureArray(raw.rankedCities).map((item: any, index: number) => ({
      cityId: String(item.cityId || ""),
      score: Number(item.score || 0),
      rank: Number(item.rank || index + 1),
      finalScore: Number(item.finalScore || 0),
      days: Number(item.days || 0)
    })),
    resultCount: Number(raw.resultCount || ensureArray(raw.cityIds).length || 0),
    coverCityId: String(raw.coverCityId || ensureArray<string>(raw.cityIds)[0] || "")
  } satisfies RecommendationDoc;
}

const getRawContentData = cache(async () => {
  const [cities, itineraries, places, posts] = await Promise.all([
    fetchCollection("cities"),
    fetchCollection("itineraries"),
    fetchCollection("places"),
    fetchCollection("posts")
  ]);
  return { cities, itineraries, places, posts };
});

const getRawRecommendationData = cache(async () => {
  const recommendations = await fetchCollection("recommendations");
  return { recommendations };
});

export const getAllStories = cache(async () => {
  const { cities, itineraries, places, posts } = await getRawContentData();
  const structuredBlogs = sortPostsByCreatedAt(buildStructuredBlogs(cities, itineraries, places));
  const legacyBlogs = sortPostsByCreatedAt(posts.map((doc) => normalizeLoadedBlog(doc)));
  return mergeBlogCollections(structuredBlogs, legacyBlogs);
});

export function getStorySlug(blog: TravelBlog) {
  return slugify(blog.cityId || blog.id || `${blog.city}-${blog.country}`);
}

export async function getStoryByDestination(country: string, city: string) {
  const stories = await getAllStories();
  const countrySlug = slugify(country);
  const citySlug = slugify(city);
  return (
    stories.find((story) => slugify(story.country) === countrySlug && slugify(story.city) === citySlug) || null
  );
}

export async function getStoryBySlug(slug: string) {
  const stories = await getAllStories();
  return (
    stories.find((story) => {
      const keys = new Set([...getCityLookupKeys(story), getStorySlug(story)]);
      return keys.has(slugify(slug));
    }) || null
  );
}

export const getAllRecommendations = cache(async () => {
  const stories = await getAllStories();
  const { recommendations } = await getRawRecommendationData();
  const persistedById = new Map(
    recommendations.map((doc) => [doc.id, normalizeRecommendationDoc(doc)])
  );

  return RECOMMENDATION_INTENTS.map((intent) => {
    const generated = buildRecommendationDocument(intent, stories);
    const persisted = persistedById.get(intent.id);
    return persisted ? { ...persisted, ...generated } : generated;
  });
});

export async function getRecommendationById(id: string) {
  const recommendations = await getAllRecommendations();
  return recommendations.find((item) => item.id === id) || null;
}

export async function getStoriesForRecommendation(recommendation: RecommendationDoc) {
  const stories = await getAllStories();
  const storiesById = new Map(stories.map((story) => [story.id, story]));
  const storiesByCityId = new Map(stories.map((story) => [story.cityId, story]));
  return recommendation.cityIds
    .map((cityId) => storiesById.get(cityId) || storiesByCityId.get(cityId))
    .filter((story): story is TravelBlog => Boolean(story));
}
