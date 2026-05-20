import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported, logEvent } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA0kSb-V1yZuq_j4gUCUC43GD-UK1Wzfh0",
  authDomain: "travelwebsite-d2716.firebaseapp.com",
  projectId: "travelwebsite-d2716",
  storageBucket: "travelwebsite-d2716.firebasestorage.app",
  messagingSenderId: "1096145054146",
  appId: "1:1096145054146:web:bf2039f6d149ff31af4e5b",
  measurementId: "G-HPH5NHBT8M"
};

let analyticsPromise = null;
let pageTrackingStarted = false;
let historyPatched = false;
let lastPageViewKey = "";
let pendingPageViewFrame = 0;
let getPageContext = defaultPageContext;
const startedForms = new Set();
const ANALYTICS_CONSENT_KEY = "smiles_and_postcards_analytics_consent";

function getConsentStatus() {
  try {
    return localStorage.getItem(ANALYTICS_CONSENT_KEY) || "unknown";
  } catch (error) {
    console.info("Unable to read analytics consent status.", error);
    return "unknown";
  }
}

function hasAnalyticsConsent() {
  return getConsentStatus() === "granted";
}

function setConsentStatus(status) {
  const normalized = status === "granted" ? "granted" : "denied";
  try {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, normalized);
  } catch (error) {
    console.info("Unable to persist analytics consent status.", error);
  }

  if (normalized === "granted" && pageTrackingStarted) {
    void getAnalyticsInstance().then(() => {
      schedulePageView();
    });
  }

  return normalized;
}

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
}

async function getAnalyticsInstance() {
  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(getFirebaseApp()) : null))
      .catch((error) => {
        console.info("Firebase Analytics is unavailable in this environment.", error);
        return null;
      });
  }

  return analyticsPromise;
}

function defaultPageContext() {
  const pagePath = `${window.location.pathname}${window.location.search}${window.location.hash}` || "/";
  return {
    page_title: document.title || "Smiles and Postcards",
    page_location: window.location.href,
    page_path: pagePath
  };
}

async function trackEvent(eventName, params = {}) {
  if (!eventName) return;
  if (!hasAnalyticsConsent()) return;
  const analytics = await getAnalyticsInstance();
  if (!analytics) return;
  logEvent(analytics, eventName, params);
}

async function trackPageView() {
  const context = getPageContext();
  const pagePath = context?.page_path || defaultPageContext().page_path;
  const pageTitle = context?.page_title || document.title || "Smiles and Postcards";
  const pageLocation = context?.page_location || window.location.href;
  const pageViewKey = `${pagePath}::${pageTitle}`;

  if (pageViewKey === lastPageViewKey) return;
  lastPageViewKey = pageViewKey;

  await trackEvent("page_view", {
    page_title: pageTitle,
    page_location: pageLocation,
    page_path: pagePath
  });
}

function schedulePageView() {
  if (pendingPageViewFrame) cancelAnimationFrame(pendingPageViewFrame);
  pendingPageViewFrame = requestAnimationFrame(() => {
    pendingPageViewFrame = 0;
    trackPageView();
  });
}

function patchHistory() {
  if (historyPatched || typeof window.history === "undefined") return;

  ["pushState", "replaceState"].forEach((methodName) => {
    const original = window.history[methodName];
    if (typeof original !== "function") return;

    window.history[methodName] = function patchedHistoryMethod(...args) {
      const result = original.apply(this, args);
      schedulePageView();
      return result;
    };
  });

  historyPatched = true;
}

function startPageTracking(options = {}) {
  if (typeof options.getPageContext === "function") {
    getPageContext = options.getPageContext;
  }

  if (pageTrackingStarted) return;

  pageTrackingStarted = true;
  patchHistory();
  window.addEventListener("hashchange", schedulePageView);
  window.addEventListener("popstate", schedulePageView);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedulePageView, { once: true });
    return;
  }

  if (hasAnalyticsConsent()) {
    void getAnalyticsInstance().then(() => {
      schedulePageView();
    });
    return;
  }

  schedulePageView();
}

function trackFormStart(formName, params = {}) {
  if (!formName || startedForms.has(formName)) return;
  startedForms.add(formName);
  return trackEvent("form_start", {
    form_name: formName,
    ...params
  });
}

function resetFormStart(formName) {
  if (!formName) return;
  startedForms.delete(formName);
}

const analyticsApi = {
  getFirebaseApp,
  getConsentStatus,
  hasAnalyticsConsent,
  setConsentStatus,
  startPageTracking,
  trackEvent,
  trackPageView,
  trackFormStart,
  resetFormStart
};

window.SmileAndPostcardsAnalytics = analyticsApi;
window.trackEvent = trackEvent;

export { getFirebaseApp, resetFormStart, startPageTracking, trackEvent, trackFormStart, trackPageView };
