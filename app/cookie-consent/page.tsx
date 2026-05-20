import type { Metadata } from "next";
import { LegalPage } from "../../components/site/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Consent",
  description: "How Smiles and Postcards uses essential and analytics cookies and how consent choices are meant to work.",
  alternates: {
    canonical: "/cookie-consent"
  }
};

export default function CookieConsentPage() {
  return (
    <LegalPage
      kicker="Cookie Consent"
      title="What cookies do here, and how consent is meant to work."
      intro="This page explains the categories of cookies or similar technologies the site may use, what each category supports, and what visitors should understand before optional analytics are enabled."
      updatedAt="May 15, 2026"
      asideText="Essential cookies may be required for core site operation. Optional analytics should only be enabled after a clear visitor choice."
    >
      <section className="legal-panel">
        <h2>Cookie categories</h2>
        <div className="legal-highlight-list">
          <div className="legal-highlight"><strong>Essential</strong><span>Required for routing, basic functionality, security, and remembering core interface state.</span></div>
          <div className="legal-highlight"><strong>Analytics</strong><span>Used to understand visits, clicks, and engagement patterns so the site can improve.</span></div>
          <div className="legal-highlight"><strong>Preference</strong><span>May remember user choices such as interface behavior, dismissed prompts, or filtering preferences.</span></div>
        </div>
      </section>

      <section className="legal-panel">
        <h2>Consent expectations</h2>
        <p>Visitors should be told, in plain language, what optional tracking is used and what happens if they accept or decline. Consent should be recorded before non-essential analytics or marketing technologies are activated.</p>
      </section>

      <section className="legal-panel">
        <h2>Managing preferences</h2>
        <p>Visitors can clear or block cookies through browser controls. If a consent management interface is present in the future, it should allow people to revisit or change their choice without friction.</p>
      </section>

      <section className="legal-panel">
        <h2>Current implementation note</h2>
        <p>The site now uses a live consent banner for analytics choices. If a broader preference center is added later, this page should stay aligned with the actual behavior implemented in the product.</p>
      </section>
    </LegalPage>
  );
}
