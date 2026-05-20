# Smiles and Postcards

Smiles and Postcards is a Next.js 15 App Router site for destination stories and recommendation-driven travel discovery.

## Stack

- Next.js 15
- React 19
- TypeScript
- Firebase Auth and Firestore APIs
- Vercel-ready deployment

## Project Structure

- `app/`: routes, metadata, sitemap, and global styles
- `components/site/`: page shells and reusable UI
- `lib/`: site config, Firestore data loading, and recommendation logic
- `public/analytics.js`: client analytics bootstrap

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
