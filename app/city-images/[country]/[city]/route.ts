import { NextResponse } from "next/server";
import { PEXELS_API_KEY } from "../../../../lib/site-config";

type RouteContext = {
  params: Promise<{
    country: string;
    city: string;
  }>;
};

type PexelsPhoto = {
  width?: number;
  height?: number;
  alt?: string;
  src?: {
    landscape?: string;
    large2x?: string;
    large?: string;
    original?: string;
  };
};

type PexelsSearchResponse = {
  photos?: PexelsPhoto[];
};

function unslugify(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getVariantQueries(city: string, country: string, variant: "card" | "hero") {
  const cityCountry = `${city}, ${country}`;

  if (variant === "card") {
    return [
      `${cityCountry} landmark`,
      `${cityCountry} famous landmark`,
      `${cityCountry} historic site`,
      `${cityCountry} old town`,
      `${cityCountry} monument`,
      `${cityCountry} bridge`,
      `${cityCountry} castle`
    ];
  }

  return [
    `${cityCountry} landmark`,
    `${cityCountry} famous landmark`,
    `${cityCountry} historic site`,
    `${cityCountry} monument`,
    `${cityCountry} cathedral`,
    `${cityCountry} castle`,
    `${cityCountry} palace`,
    `${cityCountry} bridge`,
    `${cityCountry} old town`,
    `${cityCountry} skyline`,
    `${cityCountry} cityscape`
  ];
}

function getImageSizeRequirements(variant: "card" | "hero") {
  if (variant === "hero") {
    return { minWidth: 2400, minHeight: 1600 };
  }
  return { minWidth: 1600, minHeight: 1200 };
}

function getPhotoScore(photo: PexelsPhoto, city: string, country: string, variant: "card" | "hero") {
  const alt = normalizeText(String(photo.alt || ""));
  const cityToken = normalizeText(city);
  const countryToken = normalizeText(country);
  const width = Number(photo.width || 0);
  const height = Number(photo.height || 0);
  const { minWidth, minHeight } = getImageSizeRequirements(variant);

  if (width < minWidth || height < minHeight) return -1;

  let score = 0;

  if (alt.includes(cityToken)) score += 8;
  if (countryToken && alt.includes(countryToken)) score += 4;
  if (width >= minWidth) score += 4;
  if (height >= minHeight) score += 4;
  if (width >= (minWidth + 600)) score += 2;
  if (height >= (minHeight + 400)) score += 2;

  if (variant === "card") {
    if (/(landmark|monument|bridge|castle|palace|cathedral|temple|tower|historic|old town|square)/.test(alt)) score += 12;
    if (/(skyline|cityscape|aerial|downtown|street|harbor|riverfront|panorama)/.test(alt)) score += 4;
  } else {
    if (/(monument|statue|cathedral|temple|tower|palace|bridge|landmark|old town|historic|castle|fortress|square)/.test(alt)) score += 12;
    if (/(skyline|cityscape|aerial|downtown|panorama)/.test(alt)) score += 3;
  }

  return score;
}

async function searchPexels(query: string, city: string, country: string, variant: "card" | "hero") {
  if (!PEXELS_API_KEY) return "";

  const params = new URLSearchParams({
    query,
    per_page: "15",
    orientation: "landscape",
    size: "large",
    locale: "en-US"
  });

  const response = await fetch(`https://api.pexels.com/v1/search?${params.toString()}`, {
    headers: {
      Authorization: PEXELS_API_KEY
    },
    next: {
      revalidate: 60 * 60 * 24 * 7
    }
  });

  if (!response.ok) return "";

  const payload = (await response.json()) as PexelsSearchResponse;
  const photos = Array.isArray(payload.photos) ? payload.photos : [];
  if (!photos.length) return "";

  const best = [...photos]
    .map((photo) => ({ photo, score: getPhotoScore(photo, city, country, variant) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score)[0]?.photo;

  return best?.src?.large2x || best?.src?.landscape || best?.src?.large || best?.src?.original || "";
}

async function findCityImage(citySlug: string, countrySlug: string, variant: "card" | "hero") {
  const city = unslugify(citySlug);
  const country = unslugify(countrySlug);

  for (const query of getVariantQueries(city, country, variant)) {
    const imageUrl = await searchPexels(query, city, country, variant);
    if (imageUrl) return imageUrl;
  }

  return "";
}

export async function GET(request: Request, context: RouteContext) {
  const { country, city } = await context.params;
  const { searchParams } = new URL(request.url);
  const variant = searchParams.get("variant") === "hero" ? "hero" : "card";

  if (!PEXELS_API_KEY) {
    return new NextResponse("Missing Pexels API key", {
      status: 503,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  const imageUrl = await findCityImage(city, country, variant);
  if (imageUrl) {
    return NextResponse.redirect(imageUrl, {
      status: 307,
      headers: {
        "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400"
      }
    });
  }

  return new NextResponse("City image not found", {
    status: 404,
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600"
    }
  });
}
