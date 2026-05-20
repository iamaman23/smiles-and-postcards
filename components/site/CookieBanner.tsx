"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "smiles_and_postcards_analytics_consent";

function getConsentStatus() {
  if (typeof window === "undefined") return "unknown";
  return (
    window.SmileAndPostcardsAnalytics?.getConsentStatus?.() ||
    window.localStorage.getItem(CONSENT_KEY) ||
    "unknown"
  );
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(getConsentStatus() === "unknown");
  }, []);

  function setConsent(status: "granted" | "denied") {
    if (typeof window === "undefined") return;
    if (window.SmileAndPostcardsAnalytics?.setConsentStatus) {
      window.SmileAndPostcardsAnalytics.setConsentStatus(status);
    } else {
      window.localStorage.setItem(CONSENT_KEY, status);
    }
    setIsVisible(false);
  }

  return (
    <div className={`cookie-banner${isVisible ? "" : " is-hidden"}`} id="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <div>
        <div className="cookie-banner__title">Analytics cookies</div>
        <p className="cookie-banner__text">
          We use Firebase Analytics to understand visits and clicks. Accept to enable analytics,
          or decline to keep non-essential tracking off. You can still read the full details on
          the cookie page.
        </p>
      </div>
      <div className="cookie-banner__actions">
        <button className="cookie-banner__btn cookie-banner__btn--accept" type="button" onClick={() => setConsent("granted")}>
          Accept analytics
        </button>
        <button className="cookie-banner__btn cookie-banner__btn--decline" type="button" onClick={() => setConsent("denied")}>
          Decline
        </button>
      </div>
    </div>
  );
}
