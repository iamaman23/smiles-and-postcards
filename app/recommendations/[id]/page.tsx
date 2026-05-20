import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecommendationsPage } from "../../../components/site/RecommendationsPage";
import { SeoJsonLd } from "../../../components/site/SeoJsonLd";
import { absoluteUrl } from "../../../lib/site-config";
import { getAllRecommendations, getRecommendationById, getStoriesForRecommendation } from "../../../lib/site-content";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const recommendation = await getRecommendationById(id);
  if (!recommendation) {
    return { title: "Recommendation Not Found" };
  }

  return {
    title: recommendation.title,
    description: recommendation.description,
    alternates: {
      canonical: `/recommendations/${recommendation.id}`
    }
  };
}

export default async function RecommendationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recommendations = await getAllRecommendations();
  const activeRecommendation = await getRecommendationById(id);
  if (!activeRecommendation) notFound();
  const activeBlogs = await getStoriesForRecommendation(activeRecommendation);

  return (
    <>
      <SeoJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: activeRecommendation.title,
          description: activeRecommendation.description,
          url: absoluteUrl(`/recommendations/${activeRecommendation.id}`)
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
