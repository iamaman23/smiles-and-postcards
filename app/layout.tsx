import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { AgentationOverlay } from "../components/site/AgentationOverlay";
import { CookieBanner } from "../components/site/CookieBanner";
import { SiteChromeEffects } from "../components/site/SiteChromeEffects";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "../lib/site-config";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: `${SITE_NAME} — Travel Stories Worth Following`,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Travel Stories Worth Following`,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/")
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Travel Stories Worth Following`,
    description: SITE_DESCRIPTION
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteChromeEffects />
        <AgentationOverlay />
        {children}
        <CookieBanner />
        <Script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js" strategy="afterInteractive" />
        <Script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js" strategy="afterInteractive" />
        <Script src="/analytics.js" type="module" strategy="afterInteractive" />
      </body>
    </html>
  );
}
