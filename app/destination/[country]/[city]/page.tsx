import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoJsonLd } from "../../../../components/site/SeoJsonLd";
import { StoryPage } from "../../../../components/site/StoryPage";
import { absoluteUrl, SITE_NAME } from "../../../../lib/site-config";
import { getAllStories, getDestinationPath, getStoryByDestination } from "../../../../lib/site-content";

export const revalidate = 3600;

type DestinationParams = Promise<{
  country: string;
  city: string;
}>;

function pathPartsForStory(story: Awaited<ReturnType<typeof getAllStories>>[number]) {
  const [, , country, city] = getDestinationPath(story).split("/");
  return { country, city };
}

export async function generateStaticParams() {
  const stories = await getAllStories();
  return stories.map(pathPartsForStory);
}

export async function generateMetadata({ params }: { params: DestinationParams }): Promise<Metadata> {
  const { country, city } = await params;
  const story = await getStoryByDestination(country, city);
  if (!story) return { title: "Destination Not Found" };

  const destinationPath = getDestinationPath(story);

  return {
    title: story.title,
    description: story.excerpt,
    alternates: {
      canonical: destinationPath
    },
    openGraph: {
      title: story.title,
      description: story.excerpt,
      type: "article",
      url: absoluteUrl(destinationPath),
      images: story.heroImage ? [{ url: story.heroImage, alt: story.title }] : undefined
    }
  };
}

export default async function DestinationDetailPage({ params }: { params: DestinationParams }) {
  const { country, city } = await params;
  const story = await getStoryByDestination(country, city);
  if (!story) notFound();

  const destinationPath = getDestinationPath(story);

  return (
    <>
      <SeoJsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: story.title,
            description: story.excerpt,
            image: story.heroImage || story.image,
            mainEntityOfPage: absoluteUrl(destinationPath),
            publisher: {
              "@type": "Organization",
              name: SITE_NAME
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Destinations",
                item: absoluteUrl("/")
              },
              {
                "@type": "ListItem",
                position: 2,
                name: story.country,
                item: absoluteUrl(`/destination/${country}`)
              },
              {
                "@type": "ListItem",
                position: 3,
                name: story.city,
                item: absoluteUrl(destinationPath)
              }
            ]
          }
        ]}
      />
      <StoryPage story={story} />
    </>
  );
}
