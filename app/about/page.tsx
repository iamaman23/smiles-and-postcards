import type { Metadata } from "next";
import { AboutPage } from "../../components/site/AboutPage";
import { SeoJsonLd } from "../../components/site/SeoJsonLd";
import { absoluteUrl } from "../../lib/site-config";

export const metadata: Metadata = {
  title: "About Us",
  description: "Meet the travel voice behind Smiles and Postcards and learn what shapes the site’s slower, more personal travel guides.",
  alternates: {
    canonical: "/about"
  }
};

export default function AboutRoute() {
  return (
    <>
      <SeoJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Smiles and Postcards",
          url: absoluteUrl("/about")
        }}
      />
      <AboutPage />
    </>
  );
}
