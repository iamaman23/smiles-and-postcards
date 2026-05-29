# Smiles and Postcards Project Document

## Overview

Smiles and Postcards is a travel editorial web app built with Next.js. It combines AI-assisted destination generation, structured itinerary storage, recommendation ranking, and image resolution for both landing cards and opened destination pages.

The project has two major surfaces:

- The public site, where travelers browse destination cards, open full city pages, and view recommendations.
- The admin panel, where editors generate, review, geocode, enrich, and publish structured destination content.

## Core Stack

- Next.js 15 App Router for routing, rendering, metadata, and API routes
- React 19 for UI
- TypeScript for application code
- Firebase Authentication for admin sign-in
- Supabase REST access for published content storage
- Pexels API for destination imagery
- Geoapify Geocoding API for destination and place coordinates

## Main Data Model

Published destination content is split across Supabase tables:

- `cities`: top-level destination metadata, images, scores, tags, budgets, and destination coordinates
- `itineraries`: day-by-day route structure, travel styles, food, and hidden gems
- `places`: normalized place records used by maps and cross-references
- `recommendations`: precomputed recommendation buckets for the recommendations page

The schema seed lives in [supabase/schema.sql](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/supabase/schema.sql).

## Public App Responsibilities

- [app/page.tsx](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/app/page.tsx): home page entry
- [app/destination/[country]/[city]/page.tsx](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/app/destination/[country]/[city]/page.tsx): opened destination page
- [components/site/DestinationMap.tsx](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/components/site/DestinationMap.tsx): map rendering from stored coordinates
- [components/site/HomePageExperience.tsx](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/components/site/HomePageExperience.tsx): homepage experience shell
- [components/site/RecommendationsPage.tsx](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/components/site/RecommendationsPage.tsx): recommendations UI
- [lib/site-content.ts](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/lib/site-content.ts): content normalization and assembly

## Admin Responsibilities

- [app/admin/page.tsx](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/app/admin/page.tsx): wraps the admin HTML into the Next.js app
- [app/admin/admin-reference.html](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/app/admin/admin-reference.html): primary admin UI, prompts, generation workflow, geocoding, and preview logic
- [app/api/admin/content/route.ts](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/app/api/admin/content/route.ts): authenticated admin data actions
- [lib/admin-content.ts](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/lib/admin-content.ts): publish-time normalization, validation, Supabase writes, and recommendation regeneration

## Current Generation Pipeline

1. Admin enters destination, model endpoint, Gemini key, Geoapify key, and optionally a Pexels key or manual image URLs.
2. The model returns JSON with destination content and real place names only.
3. The admin panel geocodes the destination city through Geoapify.
4. Each itinerary stop, food place, and gem is geocoded through Geoapify using city/country context plus destination bias.
5. If a place fails geocoding, the admin panel asks the model for a replacement real place and retries geocoding.
6. Verified `lat`/`lng` values are injected back into the final JSON shown in the admin preview.
7. Publish validates the final coordinates and saves structured rows into Supabase.
8. Recommendations are regenerated after publish.

## Image Strategy

There are two separate destination image roles:

- Card image: intended for homepage and list-card context, biased toward skyline, cityscape, aerial, and wider scene imagery
- Hero image: intended for the opened destination page, biased toward iconic monument and landmark imagery

Relevant files:

- [app/city-images/[country]/[city]/route.ts](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/app/city-images/[country]/[city]/route.ts)
- [app/admin/admin-reference.html](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/app/admin/admin-reference.html)

The admin flow prefers distinct Pexels results for card and hero. The public dynamic image route now follows the same idea.

## Authentication and Authorization

- Firebase Auth is used for admin email/password sign-in.
- Admin API routes verify Firebase tokens server-side before allowing writes.
- Supabase service-role backed writes happen behind server routes, not directly from the browser.

Relevant files:

- [lib/firebase-auth-server.ts](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/lib/firebase-auth-server.ts)
- [app/api/auth/sync-user/route.ts](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/app/api/auth/sync-user/route.ts)
- [lib/supabase-rest.ts](/Users/amanmodi/Documents/Codex/2026-04-29/smiles-and-postcards/lib/supabase-rest.ts)

## External Services and Their Purpose

- Gemini or compatible generation endpoint: generates editorial travel JSON and replacement places
- Geoapify Geocoding API: resolves destination and place coordinates from names
- Pexels API: resolves travel imagery for destination cards and hero backgrounds
- Firebase Auth: admin identity and session verification
- Supabase: persistent storage for published cities, itineraries, places, and recommendation sets

## Operational Notes

- Geoapify and Pexels admin keys are stored in the browser session from the admin panel.
- Public image routing can also use a server-side Pexels environment key.
- Publish now assumes coordinates were already verified in admin and performs strict validation rather than silent coordinate correction.
- Recommendation sets are regenerated automatically after destination saves and removals.

## Environment and Secrets

Server environment variables commonly used:

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PEXELS_API_KEY` or `PEXELS_API_KEY_CITY_IMAGES`
- `NEXT_PUBLIC_SITE_URL` or `SITE_URL`

Admin session keys entered in the UI:

- Gemini API key
- Geoapify API key
- Pexels API key

## Key Constraints

- Destination and place coordinates must be real and precise.
- Coordinates are no longer requested from the model.
- Only real named places likely to exist in map databases should be generated.
- Card and hero images should not collapse to the same image unless no distinct candidate exists.
- Recommendation content is derived from published content, not edited manually.

## Suggested Maintenance Areas

- Move the large admin HTML script into typed modules when time allows.
- Add automated tests around generation normalization and image-pair selection.
- Consider moving admin-side geocoding and replacement into a server route if centralized secret handling becomes important.
