# Smiles and Postcards

Smiles and Postcards is a Next.js 15 App Router site for destination stories and recommendation-driven travel discovery.

## Stack

- Next.js 15
- React 19
- TypeScript
- Firebase Auth
- Supabase storage via REST
- Vercel-ready deployment

## Project Structure

- `app/`: routes, metadata, sitemap, and global styles
- `components/site/`: page shells and reusable UI
- `lib/`: site config, Supabase data loading, admin content helpers, and recommendation logic
- `public/analytics.js`: client analytics bootstrap
- `supabase/schema.sql`: base Supabase tables and indexes for published content

## Local Development

1. Install dependencies with `npm install`
2. Run `npm run dev`
3. Open `http://localhost:3000`

## Production

- Build with `npm run build`
- Start locally with `npm run start`
- Deploy directly to Vercel as a standard Next.js project

## Environment Notes

The site can derive its canonical base URL from Vercel automatically. If needed, you can also set one of:

- `NEXT_PUBLIC_SITE_URL`
- `SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PEXELS_API_KEY` or `PEXELS_API_KEY_CITY_IMAGES` for server-side city image search

## City Images

- Dynamic city images are resolved through `/city-images/[country]/[city]`
- The image resolver uses the Pexels Photo Search API with a server-side API key
- `variant=card` prefers wider city snapshots such as skylines or cityscapes
- `variant=hero` prefers famous landmarks, monuments, cathedrals, bridges, or old-town imagery
