import type { Metadata } from "next";
import { RecommendationsPage } from "../../components/site/RecommendationsPage";
import { SeoJsonLd } from "../../components/site/SeoJsonLd";
import { absoluteUrl } from "../../lib/site-config";
import { getAllRecommendations, getStoriesForRecommendation } from "../../lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recommendations",
  description: "Explore ranked recommendation lanes for different travel moods, budgets, and trip styles.",
  alternates: {
    canonical: "/recommendations"
  }
};

export default async function RecommendationsIndexPage() {
  const recommendations = await getAllRecommendations();
  const activeRecommendation = recommendations[0] || null;
  const activeBlogs = activeRecommendation ? await getStoriesForRecommendation(activeRecommendation) : [];

  return (
    <>
      <SeoJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Travel Recommendations",
          url: absoluteUrl("/recommendations")
        }}
      />
      <RecommendationsPage
        recommendations={recommendations}
        activeRecommendation={activeRecommendation}
        activeBlogs={activeBlogs}
      />
    </>
  );
}
