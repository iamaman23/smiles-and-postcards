import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/site-config";
import { getAllRecommendations, getAllStories, getDestinationPath } from "../lib/site-content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stories, recommendations] = await Promise.all([getAllStories(), getAllRecommendations()]);

  return [
    "/",
    "/about",
    "/recommendations",
    "/privacy-policy",
    "/terms-and-conditions",
    "/cookie-consent",
    ...stories.map((story) => getDestinationPath(story)),
    ...recommendations.map((item) => `/recommendations/${item.id}`)
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date()
  }));
}
