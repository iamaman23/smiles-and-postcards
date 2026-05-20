import { HomePageShell } from "../components/site/HomePageShell";
import { SeoJsonLd } from "../components/site/SeoJsonLd";
import { getAllStories } from "../lib/site-content";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "../lib/site-config";

export const revalidate = 3600;

export default async function HomePage() {
  const stories = await getAllStories();

  return (
    <>
      <SeoJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: absoluteUrl("/"),
          description: SITE_DESCRIPTION
        }}
      />
      <HomePageShell stories={stories} />
    </>
  );
}
