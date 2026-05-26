const GENERIC_UNSPLASH_IMAGE_MARKERS = [
  "photo-1519677100203-a0e668c92439",
  "photo-1467269204594-9661b134dd2b",
  "photo-1507525428034-b723cf961d3e",
  "photo-1491557345352-5929e343eb89",
  "photo-1500530855697-b586d89ba3ee"
];

function slugify(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildCityImageRoute(
  city: unknown,
  country: unknown,
  variant: "card" | "hero" = "card"
) {
  const citySlug = slugify(city) || "destination";
  const countrySlug = slugify(country) || "destination";
  return `/city-images/${countrySlug}/${citySlug}?variant=${variant}`;
}

export function isGenericCityFallbackImage(url: unknown) {
  const value = String(url || "").trim();
  if (!value) return true;
  return GENERIC_UNSPLASH_IMAGE_MARKERS.some((marker) => value.includes(marker));
}

