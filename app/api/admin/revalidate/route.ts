import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const DEFAULT_COLLECTIONS = ["cities", "itineraries", "places", "recommendations", "siteConfig"] as const;

function normalizeCollectionList(value: unknown) {
  if (!Array.isArray(value)) return [...DEFAULT_COLLECTIONS];

  const normalized = value
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  return normalized.length ? [...new Set(normalized)] : [...DEFAULT_COLLECTIONS];
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    const requestUrl = new URL(request.url);
    if (origin && origin !== requestUrl.origin) {
      return NextResponse.json(
        {
          revalidated: false,
          error: "Cross-origin revalidation is not allowed."
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const collections = normalizeCollectionList(body?.collections);

    collections.forEach((collection) => {
      revalidateTag(`content:${collection}`);
    });
    revalidateTag("content:all");

    return NextResponse.json({
      revalidated: true,
      collections
    });
  } catch (error) {
    return NextResponse.json(
      {
        revalidated: false,
        error: error instanceof Error ? error.message : "Unknown revalidation failure."
      },
      { status: 500 }
    );
  }
}
