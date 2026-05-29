# Smiles and Postcards Design System

## Document Status

- Project: Smiles and Postcards
- Audit date: 2026-05-29
- Source of truth reviewed:
  - `app/globals.css`
  - `app/layout.tsx`
  - `app/page.tsx`
  - `app/destination/[country]/[city]/page.tsx`
  - `app/recommendations/page.tsx`
  - `app/about/page.tsx`
  - `components/site/*`
  - `lib/site-config.ts`
  - `lib/site-content.ts`
- Scope: current implemented frontend design schema, shared UI patterns, page structure, interaction behavior, and content-to-UI mapping

## 1. Purpose

This document describes the current visual and structural design system implemented in the repository. It is intended to be the future-facing reference for maintaining, extending, or redesigning the site without losing the existing brand language.

The current design system is not split across a dedicated token package or component library. It is implemented as:

1. One global stylesheet in `app/globals.css`
2. Shared page shells and reusable UI in `components/site/`
3. Route composition in the App Router under `app/`
4. Content normalization and view-model shaping in `lib/site-content.ts`

## 2. Design Principles

The implemented interface expresses a consistent editorial travel brand with these recurring traits:

- Slow-travel, cinematic, human-paced positioning
- Magazine-like presentation rather than utility-dashboard styling
- Warm paper tones with dark forest and terracotta accents
- Serif-driven headlines with clean sans body copy
- Layered backgrounds, soft borders, rounded cards, and gentle depth
- Discovery-first UX: browse by mood, then commit to a route
- Strong distinction between hero, editorial cards, and utility surfaces

## 3. Architecture

### 3.1 Styling Model

- Global CSS file: `app/globals.css`
- Class naming: mostly BEM-style blocks such as `.hero__title`, `.blog-card__meta`, `.reco-shell__sidebar`
- Shared tokens: declared in `:root`
- Responsive behavior: two main breakpoints
  - `@media (max-width: 1024px)`
  - `@media (max-width: 768px)`
- Motion reduction support:
  - `@media (prefers-reduced-motion: reduce)`

### 3.2 Layout Composition

- `app/layout.tsx` sets:
  - global font imports from Google Fonts
  - site-wide metadata
  - analytics script
  - Firebase scripts
  - `SiteChromeEffects`
  - `AgentationOverlay`
  - `CookieBanner`
- Shared chrome is component-driven:
  - `SiteNav`
  - `SiteFooter`

## 4. Brand Foundation

### 4.1 Voice

The brand voice is editorial, reflective, and grounded. It avoids booking-platform energy and instead emphasizes:

- thoughtful travel
- practical route planning
- real places
- slower itineraries
- quiet confidence over hype

### 4.2 Core Messaging

Current recurring copy themes:

- "Travel slower. See more."
- "Field guide to thoughtful travel"
- "Travel stories worth following"
- "Editorial discovery, not booking noise"

## 5. Design Tokens

The current token system lives in `:root` in `app/globals.css`.

### 5.1 Color Tokens

| Token | Role | Current value |
| --- | --- | --- |
| `--bg-warm` | main warm base | `oklch(96.8% 0.012 84)` |
| `--bg-card` | elevated card base | `oklch(98.8% 0.006 84)` |
| `--bg-dark` | dark contrast surfaces | `oklch(26% 0.02 196)` |
| `--bg-note` | muted note surfaces | `oklch(94.8% 0.016 82)` |
| `--text-primary` | main text | `oklch(28% 0.022 196)` |
| `--text-muted` | supporting text | `oklch(55% 0.016 190)` |
| `--text-light` | text on dark media | `oklch(80% 0.012 84)` |
| `--terracotta` | warm accent | `oklch(58% 0.11 42)` |
| `--forest` | primary brand accent | `oklch(39% 0.038 185)` |
| `--gold` | premium highlight | `oklch(73% 0.08 83)` |
| `--gold-light` | light gold support | `oklch(86% 0.05 88)` |
| `--cream` | pale accent background | `oklch(95.4% 0.012 86)` |
| `--border` | neutral border | `oklch(88.5% 0.01 82)` |

### 5.2 Typography Tokens

| Token | Usage | Font |
| --- | --- | --- |
| `--font-display` | headlines, titles, hero statements | `Newsreader` |
| `--font-body` | body text, controls, labels | `Instrument Sans` |
| `--font-accent` | italics, editorial flourishes | `Instrument Serif` |

### 5.3 Radius Tokens

| Token | Value | Typical use |
| --- | --- | --- |
| `--radius-lg` | `28px` | large cards, major modules |
| `--radius-md` | `20px` | panels and standard cards |
| `--radius-sm` | `14px` | compact blocks |

### 5.4 Shadow Tokens

| Token | Purpose |
| --- | --- |
| `--shadow-soft` | hero-level and premium card lift |
| `--shadow-card` | standard elevated card surfaces |
| `--shadow-line` | inset highlight for controls |

### 5.5 Layout Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--content-width` | `1320px` | max content width |
| `--home-card-height` | `480px` | homepage card rhythm |

### 5.6 Motion Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | primary entrance motion |
| `--ease-out-quart` | `cubic-bezier(0.25, 1, 0.5, 1)` | smaller hover/control motion |

## 6. Global Surface Rules

### 6.1 Page Background

The body background is not flat. It uses:

- radial warm glow top-left
- radial forest glow upper-right
- layered warm linear gradient
- subtle vertical repeating line texture via `body::before`

This creates the "printed editorial paper" atmosphere used site-wide.

### 6.2 Focus and Accessibility

Focusable elements use a warm outline:

- `3px solid rgba(167, 104, 61, 0.34)`
- `outline-offset: 4px`

### 6.3 Performance Pattern

The following blocks use `content-visibility: auto`:

- `.travel-note`
- `.blog-grid`
- `.reco-layout`
- `.content-section`

## 7. Navigation Schema

Implemented in `components/site/SiteNav.tsx`.

### 7.1 Structure

- fixed top navigation
- left-aligned logo
- right-aligned links
- auth action on the far right
- collapses to toggle menu on mobile

### 7.2 Nav Items

- Stories
- Recommendations
- About
- Sign in with Google / Sign out

### 7.3 Behavior

- `SiteChromeEffects` adds `.scrolled` after `window.scrollY > 60`
- scrolled nav gains:
  - translucent warm background
  - shadow
  - bottom border
  - reduced padding
- mobile nav becomes an absolute dropdown panel

## 8. Motion and Interaction Schema

### 8.1 Entry Motion

- Hero copy uses staged `fadeUp`
- Scroll hint uses `float`
- Section reveals use `.reveal` plus `IntersectionObserver`
- Page state classes `.page`, `.active`, `.visible` exist for transition support

### 8.2 Hover Language

Current hover pattern is restrained:

- slight vertical lift
- richer shadow
- accent border shift
- image scale-up on editorial cards

### 8.3 Reduced Motion

The site disables or compresses animation timing when reduced motion is preferred.

## 9. Page Design Schema

### 9.1 Home Page

Primary files:

- `app/page.tsx`
- `components/site/HomePageShell.tsx`
- `components/site/HomePageExperience.tsx`

#### Home sections

1. Fixed nav
2. Hero
3. Search and suggestions
4. Quick links
5. Travel note strip
6. Pinned stories discovery area
7. Editorial grid of destination cards
8. Footer

#### Hero schema

- full-bleed image background
- dark overlay gradients for contrast
- left-aligned editorial copy
- oversized display headline
- search capsule as primary call to action
- subtle lower-right scroll cue

#### Discovery schema

Two-column layout on desktop:

- left sticky discovery/filter rail
- right editorial card grid

The homepage deliberately treats discovery as browsing, not search-results-first interaction.

#### Home filters

Primary quick filters:

- Any trip
- Food & markets
- Culture & history
- Budget-friendly
- Slow & quiet

Advanced filters:

- continent
- budget range
- itinerary length
- travel style

#### Home card schema

Two card families:

- featured cards
  - media-led
  - dark overlay
  - white text
  - span 6 columns
- standard cards
  - framed editorial card
  - 230px image row
  - lighter body panel

Shared card content:

- country eyebrow
- story title
- short excerpt
- vibe pill
- duration / season context
- score summary

### 9.2 Destination Detail Page

Primary files:

- `app/destination/[country]/[city]/page.tsx`
- `components/site/StoryPage.tsx`
- `components/site/ItineraryExperience.tsx`
- `components/site/ItineraryTabs.tsx`
- `components/site/DestinationMap.tsx`

#### Detail page sections

1. Media hero
2. Stats bar
3. Main content column
4. Sticky sidebar
5. Footer

#### Hero schema

- 70vh media header
- dark bottom overlay
- back link
- country label
- large story title
- metadata row for duration and season

#### Stats bar schema

Four-column dark band:

- Days
- Cost Level
- Best Month
- Walkability

#### Content-section schema

Every editorial section follows the same structure:

- icon block
- serif title
- muted subtitle
- bottom divider

Current content sections:

- Itinerary
- Best Food Spots
- Hidden Gems
- Highlights
- Budget Breakdown
- Warnings and Skip If

#### Itinerary schema

The current itinerary experience is tab-based, not timeline-first.

- numeric day buttons
- one visible panel at a time
- title and description for active day
- location pills
- synchronized map module

#### Map schema

Map design rules:

- framed inside rounded editorial panel
- custom marker design with numbered badge
- popup card styled to match content system
- map style toggle pills
- empty state and loading overlay support

#### Sidebar schema

Current sidebar modules:

- table of contents
- city snapshot pills
- score bars
- tags

### 9.3 Recommendations Page

Primary files:

- `app/recommendations/page.tsx`
- `components/site/RecommendationsPage.tsx`
- `components/site/RecommendationsGate.tsx`

#### Recommendations structure

1. Access gate
2. Recommendation hero
3. Sidebar of recommendation intents
4. Active ranked-city result pane

#### Visual treatment

- same warm editorial background family as home
- dark secondary hero note card for contrast
- sticky left rail on desktop
- result cards reuse homepage editorial card language

#### Recommendation card schema

Intent cards include:

- eyebrow label
- title
- description
- pills derived from filters

#### Ranked city schema

Each result uses:

- ranking badge
- city image
- title/excerpt
- vibe signal
- duration / season
- score trio

### 9.4 About Page

Primary files:

- `app/about/page.tsx`
- `components/site/AboutPage.tsx`

#### About schema

- split editorial layout
- left narrative card with warm paper gradients
- right immersive image block
- overlay note card pinned to image

### 9.5 Legal and Cookie Pages

Primary files:

- `components/site/LegalPage.tsx`
- `components/site/CookieBanner.tsx`

#### Legal schema

- top hero with summary card and meta panel
- stacked legal panels below
- highlight chips/cards for scannability

#### Cookie schema

- fixed bottom dark consent banner
- clear accept / decline split
- remains visually distinct from editorial surfaces

## 10. Reusable Component Inventory

### 10.1 Structural Components

- `SiteNav`
- `SiteFooter`
- `HomePageShell`
- `LegalPage`

### 10.2 Experience Components

- `HomePageExperience`
- `StoryPage`
- `RecommendationsPage`
- `AboutPage`

### 10.3 Interactive Components

- `CookieBanner`
- `ItineraryTabs`
- `DestinationMap`
- `RecommendationsGate`
- `SiteChromeEffects`

### 10.4 SEO / Support Components

- `SeoJsonLd`
- `AgentationOverlay`

## 11. Content Model to UI Mapping

The implemented design depends on `TravelBlog` and related content models from `lib/site-content.ts`.

### 11.1 `TravelBlog` fields actively expressed in UI

- `city`
- `country`
- `title`
- `excerpt`
- `image`
- `heroImage`
- `featured`
- `days`
- `budget`
- `bestSeason`
- `tags`
- `travelStyles`
- `stats`
- `itinerary`
- `food`
- `gems`
- `highlights`
- `budgetBreakdown`
- `scores`
- `experience`
- `meta.continent`
- `showOnHome`
- `pinned`
- `warnings`
- `skipIf`

### 11.2 UI implications of the data model

- Homepage visibility depends on `showOnHome` and `pinned`
- Hero/detail imagery supports separate card and hero image roles
- Filters depend on tags, travel styles, continent, budget, and day count
- Recommendation lanes depend on normalized intent and ranking data
- Maps depend on place-level coordinates in `spotDetails`, `food`, and `gems`

## 12. Responsive Schema

### 12.1 Desktop-first behavior

The site is clearly designed desktop-first, then collapsed for tablet and mobile.

### 12.2 Tablet breakpoint `1024px`

Key changes:

- multi-column legal layout becomes single column
- destination detail becomes one-column main flow
- sidebar loses sticky behavior
- recommendations hero and shell collapse to one column

### 12.3 Mobile breakpoint `768px`

Key changes:

- nav becomes dropdown
- hero side padding reduces
- homepage discovery rail becomes inline
- editorial card grid becomes single column
- about page becomes stacked
- stats bar becomes two-by-two
- destination sidebar becomes stacked below content
- mobile guide shortcuts appear
- recommendation intent grid is hidden in favor of a mobile picker
- cookie banner becomes one-column

## 13. Accessibility Notes

Current implemented strengths:

- semantic headings are used throughout
- tab semantics are present in itinerary tabs
- focus-visible states exist globally
- reduced motion support exists
- cookie banner uses dialog semantics
- map markers expose accessible labels

Current risks to keep in mind:

- several cards use `img` rather than `next/image`
- contrast should be rechecked whenever hero photography changes
- some interaction states rely heavily on color and hover
- mobile nav and map flows should continue to be keyboard tested after changes

## 14. Design Rules for Future Work

When extending the current system, preserve these rules unless an intentional redesign is approved:

1. Keep the warm-editorial palette anchored in cream, forest, terracotta, and gold.
2. Use `Newsreader` for primary display hierarchy and `Instrument Sans` for utility/body text.
3. Prefer layered backgrounds and soft gradients over flat blocks.
4. Maintain rounded surfaces with gentle depth rather than sharp utility panels.
5. Reuse existing section-header patterns for new longform content blocks.
6. Keep cards editorial and readable before making them data-dense.
7. Preserve the distinction between:
   - immersive media heroes
   - framed content cards
   - dark utility overlays
8. Keep motion subtle, vertical, and easing-rich.
9. Continue supporting reduced motion and strong keyboard focus.
10. Add new reusable styles in the current token vocabulary instead of introducing unrelated colors or typefaces.

## 15. Recommended Future Refactor Path

The current system is cohesive, but it is still centralized in one large stylesheet. A safe future refactor path would be:

1. Extract design tokens into a dedicated file or CSS layer.
2. Document major component variants explicitly:
   - card
   - pill
   - section header
   - panel
   - hero
3. Split large CSS regions by surface:
   - navigation
   - home
   - detail
   - recommendations
   - legal/about
4. Convert repeated utility patterns into shared React primitives only if that improves consistency without flattening the editorial tone.
5. Add visual regression coverage for:
   - home hero
   - home card grid
   - destination detail hero
   - map panel
   - recommendations two-column layout

## 16. Source-of-Truth Summary

If there is ever a mismatch between this document and the app, treat the code as the primary truth, especially:

- `app/globals.css` for visual rules
- `components/site/` for structural composition
- `lib/site-content.ts` for content schema and UI-facing data normalization

This document reflects the current implemented design system, not an aspirational redesign.
