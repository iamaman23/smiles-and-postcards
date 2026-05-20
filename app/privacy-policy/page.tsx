import type { Metadata } from "next";
import { LegalPage } from "../../components/site/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Smiles and Postcards collects, uses, stores, and responds to visitor data and analytics information.",
  alternates: {
    canonical: "/privacy-policy"
  }
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      kicker="Privacy Policy"
      title="How Smiles and Postcards handles visitor data."
      intro="This page explains what information may be collected when someone uses the site, why it is collected, and how it is used to keep the experience functional, measurable, and easier to improve."
      updatedAt="May 15, 2026"
      asideText="Questions about privacy can be routed through the site contact channel before any personal request is processed."
    >
      <section className="legal-panel">
        <h2>What may be collected</h2>
        <div className="legal-highlight-list">
          <div className="legal-highlight"><strong>Usage data</strong><span>Page views, route changes, and interaction events such as clicks on navigation, cards, and calls to action.</span></div>
          <div className="legal-highlight"><strong>Technical data</strong><span>Browser, device, language, referring page, and approximate location inferred from IP by platform providers.</span></div>
          <div className="legal-highlight"><strong>Optional input</strong><span>Information visitors choose to submit in forms, search boxes, or account areas.</span></div>
        </div>
      </section>

      <section className="legal-panel">
        <h2>How that information is used</h2>
        <ul>
          <li>To understand which pages, stories, and recommendation paths are actually helpful to readers.</li>
          <li>To maintain site reliability, prevent abuse, and debug broken flows.</li>
          <li>To improve editorial decisions, search experiences, and navigation over time.</li>
        </ul>
      </section>

      <section className="legal-panel">
        <h2>Analytics and third-party services</h2>
        <p>The site uses Firebase services, including analytics, to measure usage and understand behavior patterns such as page visits and interaction events. Third-party providers may process technical information needed to deliver hosting, storage, and analytics features.</p>
        <p>Collected information is used in aggregate wherever possible and is not intended to identify a visitor personally unless that visitor explicitly provides personal information through a separate contact or account workflow.</p>
      </section>

      <section className="legal-panel">
        <h2>Retention and requests</h2>
        <p>Data is retained only for as long as it is reasonably useful for security, product improvement, legal compliance, or support. If a visitor wants to ask about access, correction, or deletion of personal information they submitted directly, they should use the site’s contact method and include enough context for the request to be verified.</p>
      </section>
    </LegalPage>
  );
}
