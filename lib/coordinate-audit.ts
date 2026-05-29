type GeoPoint = {
  lat: number;
  lng: number;
};

type PlaceLike = {
  name?: string;
  geo?: unknown;
};

type BlogLike = {
  city?: string;
  country?: string;
  geo?: unknown;
  createdAt?: string;
  itinerary?: Array<{
    day?: string;
    title?: string;
    spots?: Array<PlaceLike | string>;
  }>;
  food?: PlaceLike[];
  gems?: PlaceLike[];
};

export type CoordinateAuditEntry = {
  label: string;
  query: string;
  original: GeoPoint;
  resolved: GeoPoint;
  resolvedLabel: string;
  distanceKm: number;
  action: "confirmed" | "corrected";
};

type NominatimResult = {
  lat?: string;
  lon?: string;
  name?: string;
  display_name?: string;
  addresstype?: string;
  type?: string;
  address?: Record<string, string | undefined>;
};

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const COORDINATE_DECIMALS = 6;
const DESTINATION_MAX_DRIFT_KM = 25;
const PLACE_MAX_DRIFT_KM = 1.5;
const PLACE_MAX_CITY_RADIUS_KM = 80;
const DESTINATION_MIN_SCORE = 45;
const PLACE_MIN_SCORE = 70;
const STOPWORDS = new Set([
  "the",
  "and",
  "de",
  "la",
  "le",
  "el",
  "of",
  "at",
  "in",
  "on",
  "old",
  "new"
]);

function normalizeText(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getTokens(value: unknown) {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function toGeoPoint(result: NominatimResult) {
  const lat = Number(result.lat);
  const lng = Number(result.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    lat: Number(lat.toFixed(COORDINATE_DECIMALS)),
    lng: Number(lng.toFixed(COORDINATE_DECIMALS))
  };
}

function toInputGeoPoint(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const lat = Number((value as Record<string, unknown>).lat);
  const lng = Number((value as Record<string, unknown>).lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function haversineKm(a: GeoPoint, b: GeoPoint) {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const value =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(value));
}

function getAddressParts(result: NominatimResult) {
  const address = result.address || {};
  return normalizeText(
    [
      address.amenity,
      address.attraction,
      address.building,
      address.neighbourhood,
      address.suburb,
      address.city,
      address.town,
      address.village,
      address.municipality,
      address.county,
      address.state,
      address.country
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function scoreDestinationResult(result: NominatimResult, city: string, country: string) {
  const haystack = `${normalizeText(result.name)} ${normalizeText(result.display_name)} ${getAddressParts(result)}`;
  const cityTokens = getTokens(city);
  const countryTokens = getTokens(country);
  let score = 0;

  if (cityTokens.every((token) => haystack.includes(token))) score += 35;
  score += cityTokens.filter((token) => haystack.includes(token)).length * 10;
  if (countryTokens.every((token) => haystack.includes(token))) score += 20;
  score += countryTokens.filter((token) => haystack.includes(token)).length * 5;
  if (["city", "town", "municipality", "administrative"].includes(String(result.addresstype || ""))) score += 10;

  return score;
}

function scorePlaceResult(result: NominatimResult, placeName: string, city: string, country: string) {
  const haystack = `${normalizeText(result.name)} ${normalizeText(result.display_name)} ${getAddressParts(result)}`;
  const placeTokens = getTokens(placeName);
  const cityTokens = getTokens(city);
  const countryTokens = getTokens(country);
  let score = 0;

  if (normalizeText(result.name) === normalizeText(placeName)) score += 40;
  if (haystack.includes(normalizeText(placeName))) score += 30;
  score += placeTokens.filter((token) => haystack.includes(token)).length * 10;
  if (cityTokens.some((token) => haystack.includes(token))) score += 15;
  if (countryTokens.some((token) => haystack.includes(token))) score += 10;
  if (["amenity", "tourism", "attraction", "historic", "leisure", "shop", "building", "neighbourhood", "suburb"].includes(String(result.addresstype || ""))) {
    score += 5;
  }

  return score;
}

async function searchNominatim(query: string) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    limit: "5"
  });
  const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params.toString()}`, {
    headers: {
      "Accept-Language": "en",
      "User-Agent": "SmilesAndPostcards/1.0"
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Coordinate verification failed for "${query}" with status ${response.status}.`);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? (payload as NominatimResult[]) : [];
}

async function resolveDestination(city: string, country: string) {
  const query = [city, country].filter(Boolean).join(", ");
  const results = await searchNominatim(query);
  const scored = results
    .map((result) => ({ result, score: scoreDestinationResult(result, city, country), geo: toGeoPoint(result) }))
    .filter((entry) => entry.geo)
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < DESTINATION_MIN_SCORE || !best.geo) {
    throw new Error(`Unable to confidently verify destination coordinates for "${query}".`);
  }

  return {
    query,
    geo: best.geo,
    resolvedLabel: best.result.display_name || best.result.name || query
  };
}

async function resolvePlace(placeName: string, city: string, country: string, destinationGeo: GeoPoint) {
  const query = [placeName, city, country].filter(Boolean).join(", ");
  const results = await searchNominatim(query);
  const scored = results
    .map((result) => {
      const geo = toGeoPoint(result);
      return {
        result,
        geo,
        score: scorePlaceResult(result, placeName, city, country),
        cityDistanceKm: geo ? haversineKm(destinationGeo, geo) : Number.POSITIVE_INFINITY
      };
    })
    .filter((entry) => entry.geo && entry.cityDistanceKm <= PLACE_MAX_CITY_RADIUS_KM)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.cityDistanceKm - b.cityDistanceKm;
    });

  const best = scored[0];
  if (!best || !best.geo || best.score < PLACE_MIN_SCORE) {
    throw new Error(`Unable to confidently verify coordinates for "${placeName}" in ${city}, ${country}.`);
  }

  return {
    query,
    geo: best.geo,
    resolvedLabel: best.result.display_name || best.result.name || query
  };
}

function pushAuditEntry(entries: CoordinateAuditEntry[], label: string, query: string, original: GeoPoint, resolved: GeoPoint, resolvedLabel: string, maxDriftKm: number) {
  const distanceKm = haversineKm(original, resolved);
  entries.push({
    label,
    query,
    original,
    resolved,
    resolvedLabel,
    distanceKm: Number(distanceKm.toFixed(3)),
    action: distanceKm > maxDriftKm ? "corrected" : "confirmed"
  });
  return distanceKm > maxDriftKm;
}

export async function auditAndCorrectBlogCoordinates<T extends BlogLike>(draft: T) {
  const corrected = JSON.parse(JSON.stringify(draft || {})) as T;
  const city = String(corrected.city || "").trim();
  const country = String(corrected.country || "").trim();
  const originalDestination = toInputGeoPoint(corrected.geo);

  if (!city || !country || !originalDestination) {
    throw new Error("Coordinate verification requires destination city, country, and coordinates.");
  }

  const auditEntries: CoordinateAuditEntry[] = [];
  const resolvedDestination = await resolveDestination(city, country);
  corrected.geo = resolvedDestination.geo as T["geo"];
  pushAuditEntry(
    auditEntries,
    `destination "${city}"`,
    resolvedDestination.query,
    originalDestination,
    resolvedDestination.geo,
    resolvedDestination.resolvedLabel,
    DESTINATION_MAX_DRIFT_KM
  );

  for (const day of corrected.itinerary || []) {
    for (const spot of day?.spots || []) {
      if (!spot || typeof spot === "string" || !spot.name || !spot.geo) continue;
      const originalSpotGeo = toInputGeoPoint(spot.geo);
      if (!originalSpotGeo) continue;
      const resolved = await resolvePlace(String(spot.name), city, country, resolvedDestination.geo);
      const changed = pushAuditEntry(
        auditEntries,
        `itinerary "${String(day?.title || day?.day || "Untitled day")}" -> ${String(spot.name)}`,
        resolved.query,
        originalSpotGeo,
        resolved.geo,
        resolved.resolvedLabel,
        PLACE_MAX_DRIFT_KM
      );
      if (changed) {
        spot.geo = resolved.geo as PlaceLike["geo"];
      }
    }
  }

  for (const place of corrected.food || []) {
    if (!place?.name || !place.geo) continue;
    const originalPlaceGeo = toInputGeoPoint(place.geo);
    if (!originalPlaceGeo) continue;
    const resolved = await resolvePlace(String(place.name), city, country, resolvedDestination.geo);
    const changed = pushAuditEntry(
      auditEntries,
      `food "${String(place.name)}"`,
      resolved.query,
      originalPlaceGeo,
      resolved.geo,
      resolved.resolvedLabel,
      PLACE_MAX_DRIFT_KM
    );
    if (changed) {
      place.geo = resolved.geo as PlaceLike["geo"];
    }
  }

  for (const place of corrected.gems || []) {
    if (!place?.name || !place.geo) continue;
    const originalPlaceGeo = toInputGeoPoint(place.geo);
    if (!originalPlaceGeo) continue;
    const resolved = await resolvePlace(String(place.name), city, country, resolvedDestination.geo);
    const changed = pushAuditEntry(
      auditEntries,
      `hidden gem "${String(place.name)}"`,
      resolved.query,
      originalPlaceGeo,
      resolved.geo,
      resolved.resolvedLabel,
      PLACE_MAX_DRIFT_KM
    );
    if (changed) {
      place.geo = resolved.geo as PlaceLike["geo"];
    }
  }

  return {
    correctedDraft: corrected,
    report: auditEntries
  };
}
