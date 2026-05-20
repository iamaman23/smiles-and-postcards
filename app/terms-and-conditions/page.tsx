import type { Metadata } from "next";
import { LegalPage } from "../../components/site/LegalPage";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "The editorial, usage, and third-party content terms that apply when using Smiles and Postcards.",
  alternates: {
    canonical: "/terms-and-conditions"
  }
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      kicker="Terms & Conditions"
      title="The basic rules for using Smiles and Postcards."
      intro="These terms explain what this site offers, what visitors can reasonably rely on, and the boundaries around editorial content, third-party links, and acceptable use."
      updatedAt="May 15, 2026"
      asideText="Using the site means accepting the current terms in effect at the time of access."
    >
      <section className="legal-panel">
        <h2>Editorial use only</h2>
        <p>Travel guides, recommendations, budgets, and seasonal suggestions are provided for informational and editorial purposes. They are not guarantees of availability, pricing, safety, or suitability for any specific traveler or situation.</p>
      </section>

      <section className="legal-panel">
        <h2>Use of the site</h2>
        <ul>
          <li>Do not misuse the site, interfere with its operation, or attempt to access restricted systems without authorization.</li>
          <li>Do not copy, scrape, republish, or redistribute substantial site content in a way that misrepresents ownership or authorship.</li>
          <li>Do not rely on the site as a substitute for local laws, travel advisories, visa guidance, or emergency planning.</li>
        </ul>
      </section>

      <section className="legal-panel">
        <h2>Third-party content and links</h2>
        <p>The site may reference external services, images, locations, businesses, or tools. Those third parties operate independently, and Smiles and Postcards is not responsible for their availability, content, pricing, or privacy practices.</p>
      </section>

      <section className="legal-panel">
        <h2>Changes and availability</h2>
        <p>Content, features, routes, and data sources may change without notice. The site may be updated, paused, or removed at any time, especially while editorial systems, recommendations, or analytics infrastructure are still evolving.</p>
      </section>
    </LegalPage>
  );
}
