import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__left">
        <div className="footer__brand">Smiles and <span>Postcards</span> © 2026</div>
        <p className="footer__note">
          Editorial travel stories, practical route planning, and slower itineraries for people
          who want the place to feel real.
        </p>
      </div>
      <div className="footer__right">
        <div className="footer__eyebrow">Legal</div>
        <div className="footer__links">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
          <Link href="/cookie-consent">Cookie Consent</Link>
        </div>
      </div>
    </footer>
  );
}
