import { type ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

type LegalPageProps = {
  kicker: string;
  title: string;
  intro: string;
  updatedAt: string;
  asideText: string;
  children: ReactNode;
};

export function LegalPage({ kicker, title, intro, updatedAt, asideText, children }: LegalPageProps) {
  return (
    <>
      <SiteNav />
      <main className="legal-page">
        <div className="legal-shell">
          <div className="legal-hero reveal">
            <div className="legal-hero__card">
              <span className="legal-kicker">{kicker}</span>
              <h1 className="legal-title">{title}</h1>
              <p className="legal-intro">{intro}</p>
            </div>
            <aside className="legal-summary">
              <div className="legal-summary__label">Last Updated</div>
              <div className="legal-summary__value">{updatedAt}</div>
              <p>{asideText}</p>
            </aside>
          </div>

          <div className="legal-grid reveal">{children}</div>
        </div>

        <SiteFooter />
      </main>
    </>
  );
}
