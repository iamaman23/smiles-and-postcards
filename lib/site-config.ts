export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA0kSb-V1yZuq_j4gUCUC43GD-UK1Wzfh0",
  authDomain: "travelwebsite-d2716.firebaseapp.com",
  projectId: "travelwebsite-d2716",
  storageBucket: "travelwebsite-d2716.firebasestorage.app",
  messagingSenderId: "1096145054146",
  appId: "1:1096145054146:web:bf2039f6d149ff31af4e5b",
  measurementId: "G-HPH5NHBT8M"
} as const;

export const SITE_NAME = "Smiles and Postcards";
export const SITE_DESCRIPTION =
  "Editorial travel stories, practical route planning, and slower itineraries for people who want the place to feel real.";
export const DEFAULT_REVALIDATE_SECONDS = 3600;

export function getSiteUrl() {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const normalizedVercelUrl = vercelUrl
    ? (vercelUrl.startsWith("http://") || vercelUrl.startsWith("https://")
        ? vercelUrl
        : `https://${vercelUrl}`)
    : undefined;

  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    normalizedVercelUrl ||
    "https://smilesandpostcards.com"
  );
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}
