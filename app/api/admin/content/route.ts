import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { verifyFirebaseRequest } from "../../../../lib/firebase-auth-server";
import {
  clearGeneratedContent,
  loadHomepageSettingsDirect,
  loadRecommendationsDirect,
  loadStoriesDirect,
  publishRecommendationsFromCurrentData,
  removeSavedCity,
  saveStoryDraft,
  toggleFeaturedState,
  toggleHomeVisibilityState,
  updateHomepageFilterTags
} from "../../../../lib/admin-content";

const TAGS_BY_SCOPE: Record<string, string[]> = {
  cities: ["content:cities", "content:all"],
  itineraries: ["content:itineraries", "content:all"],
  places: ["content:places", "content:all"],
  recommendations: ["content:recommendations", "content:all"],
  siteConfig: ["content:siteConfig", "content:all"]
};

function revalidateScopes(scopes: Array<keyof typeof TAGS_BY_SCOPE>) {
  scopes.forEach((scope) => {
    TAGS_BY_SCOPE[scope].forEach((tag) => revalidateTag(tag));
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = String(searchParams.get("view") || "saved");

    if (view === "saved") {
      return NextResponse.json({ items: await loadStoriesDirect() });
    }
    if (view === "recommendations") {
      return NextResponse.json({ items: await loadRecommendationsDirect() });
    }
    if (view === "homepage") {
      return NextResponse.json(await loadHomepageSettingsDirect());
    }

    return NextResponse.json({ error: `Unsupported admin view "${view}".` }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown admin content read failure." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyFirebaseRequest(request);
    const body = await request.json().catch(() => ({}));
    const action = String(body?.action || "");

    switch (action) {
      case "saveStory": {
        const result = await saveStoryDraft(body?.draft, admin.email);
        revalidateScopes(["cities", "itineraries", "places", "recommendations"]);
        return NextResponse.json({ ok: true, ...result });
      }
      case "publishRecommendations": {
        const generated = await publishRecommendationsFromCurrentData(admin.email);
        revalidateScopes(["recommendations"]);
        return NextResponse.json({ ok: true, generated });
      }
      case "toggleFeatured": {
        await toggleFeaturedState(String(body?.id || ""), Boolean(body?.nextFeatured));
        revalidateScopes(["cities"]);
        return NextResponse.json({ ok: true });
      }
      case "toggleHomeVisibility": {
        await toggleHomeVisibilityState(String(body?.id || ""), Boolean(body?.nextVisible));
        revalidateScopes(["cities"]);
        return NextResponse.json({ ok: true });
      }
      case "updateHomepageFilterTags": {
        await updateHomepageFilterTags(Array.isArray(body?.filterTags) ? body.filterTags : []);
        revalidateScopes(["siteConfig"]);
        return NextResponse.json({ ok: true });
      }
      case "removeSaved": {
        await removeSavedCity(String(body?.id || ""), admin.email);
        revalidateScopes(["cities", "itineraries", "places", "recommendations"]);
        return NextResponse.json({ ok: true });
      }
      case "clearSaved": {
        await clearGeneratedContent();
        revalidateScopes(["cities", "itineraries", "places", "recommendations"]);
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: `Unsupported admin action "${action}".` }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown admin content write failure.";
    const status = /missing firebase auth token|verify firebase auth token|admin account/i.test(message) ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
