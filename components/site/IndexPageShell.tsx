"use client";

import type { MouseEvent } from "react";

function callSite(name: string, ...args: unknown[]) {
  if (typeof window === "undefined") return undefined;
  const siteMethod = (window as unknown as Record<string, unknown>)[name];
  if (typeof siteMethod !== "function") return undefined;
  return (siteMethod as (...params: unknown[]) => unknown)(...args);
}

function handleNavigate(event: MouseEvent<HTMLElement>, page: string, param?: string) {
  event.preventDefault();
  callSite("navigateTo", page, param);
}

function handleQuickSearch(value: string) {
  const input = document.getElementById("search-input") as HTMLInputElement | null;
  if (input) input.value = value;
  callSite("performSearch");
}

export function IndexPageShell() {
  return (
    <>
      {/*═══════════════ NAVIGATION ═══════════════*/}
      <nav className="nav" id="nav">
        <div className="nav__logo" data-track-event="navigation_click" data-track-param-location="header" data-track-param-label="brand_logo" onClick={(event) => handleNavigate(event, 'home')}>Smiles and <span>Postcards</span></div>
        <button className="nav__toggle" type="button" aria-label="Open navigation" aria-expanded="false" data-track-event="navigation_click" data-track-param-location="header" data-track-param-label="mobile_menu" onClick={() => callSite('toggleMobileNav')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
        </button>
        <div className="nav__links" id="nav-links">
          <a className="nav__link" href="#" data-track-event="navigation_click" data-track-param-location="header" data-track-param-label="stories" onClick={(event) => handleNavigate(event, 'home')}>Stories</a>
          <a className="nav__link" href="#recommendations" data-track-event="navigation_click" data-track-param-location="header" data-track-param-label="recommendations" onClick={(event) => handleNavigate(event, 'recommendations')}>Recommendations</a>
          <a className="nav__link" href="#about" data-track-event="navigation_click" data-track-param-location="header" data-track-param-label="about" onClick={(event) => handleNavigate(event, 'about')}>About</a>
          <button className="nav__auth" id="googleSignInBtn" type="button" onClick={() => callSite('signInWithGoogle')}>Sign in with Google</button>
          <button className="nav__auth is-hidden" id="googleSignOutBtn" type="button" onClick={() => callSite('signOutPublicUser')}>Sign out</button>
        </div>
      </nav>
      
      {/*═══════════════ HOME PAGE ═══════════════*/}
      <div className="page active" id="page-home">
      
        {/*Hero*/}
        <section className="hero" id="hero">
          <div className="hero__bg"></div>
          <div className="hero__content">
            <p className="hero__tag">Field guide to thoughtful travel</p>
            <h1 className="hero__title">Travel <em>slower</em>.<br />See more.</h1>
            <p className="hero__subtitle">Editorial itineraries, small local finds, and grounded budgets for travelers who want places to unfold at a human pace.</p>
            <div className="search-wrap">
              <div className="search" id="hero-search">
                <svg className="search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="search__input" type="text" id="search-input" placeholder="Search a city, country, or vibe..." autoComplete="off" data-track-form-start="destination_search" data-track-form-location="hero" />
                <button className="search__clear" id="search-clear" type="button" aria-label="Clear search" onClick={() => callSite('clearSearch')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <button className="search__btn" data-track-event="cta_click" data-track-param-location="hero" data-track-param-label="explore_search" onClick={() => callSite('performSearch')}>Explore</button>
              </div>
              <div className="search-suggestions" id="search-suggestions"></div>
            </div>
            <div className="hero__quicklist">
              <button className="hero__quicklink" type="button" data-track-event="button_click" data-track-param-location="hero_quicklinks" data-track-param-label="quiet_mornings" onClick={() => handleQuickSearch('Kyoto')}>Quiet Mornings</button>
              <button className="hero__quicklink" type="button" data-track-event="button_click" data-track-param-location="hero_quicklinks" data-track-param-label="sunlit_cities" onClick={() => handleQuickSearch('Lisbon')}>Sunlit Cities</button>
              <button className="hero__quicklink" type="button" data-track-event="button_click" data-track-param-location="hero_quicklinks" data-track-param-label="remote_reset" onClick={() => handleQuickSearch('Bali')}>Remote Reset</button>
            </div>
          </div>
          <div className="hero__scroll">
            <span>Keep drifting</span>
            <div className="hero__scroll-line"></div>
          </div>
        </section>
      
        {/*Search Results*/}
        <section className="search-results" id="search-results"></section>
      
        {/*Editorial Note*/}
        <section className="travel-note reveal">
          <div className="travel-note__inner">
            <p className="travel-note__quote">The best trips leave enough daylight for a wrong turn that turns out right.</p>
            <span className="travel-note__mark">from the notebook</span>
          </div>
        </section>
      
        {/*Pinned Blogs*/}
        <section className="pinned reveal" id="pinned-section">
          <div className="section-header">
            <span className="section-tag">Pinned journeys</span>
            <h2 className="section-title">Stories worth lingering in</h2>
            <div className="section-line"></div>
          </div>
          <div className="pinned-layout">
            <aside className="home-filters">
              <h3 className="home-filters__title">Refine the route</h3>
              <p className="home-filters__hint">Narrow the shelf by geography, pace, budget, and travel mood.</p>
              <div className="home-filters__group">
                <label className="home-filters__label" htmlFor="filter-continent">Continent</label>
                <select className="home-filters__control" id="filter-continent"></select>
              </div>
              <div className="home-filters__group">
                <label className="home-filters__label" htmlFor="filter-country">Country</label>
                <select className="home-filters__control" id="filter-country"></select>
              </div>
              <div className="home-filters__group">
                <label className="home-filters__label" htmlFor="filter-budget-range">Budget Range</label>
                <select className="home-filters__control" id="filter-budget-range"></select>
              </div>
              <div className="home-filters__group">
                <label className="home-filters__label" htmlFor="filter-itinerary">Itinerary Length</label>
                <select className="home-filters__control" id="filter-itinerary"></select>
              </div>
              <div className="home-filters__group">
                <label className="home-filters__label" htmlFor="filter-travel-style">Travel Style</label>
                <select className="home-filters__control" id="filter-travel-style"></select>
              </div>
              <details className="home-filters__smart" open>
                <summary>Smart score filters</summary>
                <div className="home-filters__smart-body">
                  <p className="home-filters__subhint">Use weighted scores when you already know what matters most on this trip.</p>
                  <div className="home-filters__group">
                    <label className="home-filters__label" htmlFor="filter-smart-score">Score Focus</label>
                    <select className="home-filters__control" id="filter-smart-score"></select>
                  </div>
                  <div className="home-filters__group">
                    <label className="home-filters__label" htmlFor="filter-smart-score-min">Selected Score Minimum</label>
                    <select className="home-filters__control" id="filter-smart-score-min"></select>
                  </div>
                  <div className="home-filters__group">
                    <label className="home-filters__label" htmlFor="filter-final-score">Smart Match</label>
                    <select className="home-filters__control" id="filter-final-score"></select>
                  </div>
                </div>
              </details>
              <button className="btn home-filters__reset" type="button" onClick={() => callSite('resetAdvancedFilters')}>Reset Filters</button>
            </aside>
            <div className="pinned-content">
              <div className="filter-bar" id="filter-bar"></div>
              <div className="blog-grid" id="blog-grid"></div>
            </div>
          </div>
        </section>
      
        {/*Footer*/}
        <footer className="footer">
          <div className="footer__left">
            <div className="footer__brand">Smiles and <span>Postcards</span> © 2026</div>
            <p className="footer__note">Editorial travel stories, practical route planning, and slower itineraries for people who want the place to feel real.</p>
          </div>
          <div className="footer__right">
            <div className="footer__eyebrow">Legal</div>
            <div className="footer__links">
              <a href="#privacy-policy" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="privacy_policy" onClick={(event) => handleNavigate(event, 'privacy-policy')}>Privacy Policy</a>
              <a href="#terms-and-conditions" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="terms_and_conditions" onClick={(event) => handleNavigate(event, 'terms-and-conditions')}>Terms &amp; Conditions</a>
              <a href="#cookie-consent" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="cookie_consent" onClick={(event) => handleNavigate(event, 'cookie-consent')}>Cookie Consent</a>
            </div>
          </div>
        </footer>
      </div>
      
      {/*═══════════════ ABOUT PAGE ═══════════════*/}
      <div className="page" id="page-about">
        <section className="legal-page">
          <div className="legal-shell">
            <section className="about reveal" id="about">
              <div className="about-shell">
                <div className="about-copy">
                  <span className="about-copy__eyebrow">About Smiles and Postcards</span>
                  <h1 className="about-copy__title">The Person Behind the Passport</h1>
                  <div className="about-copy__body">
                    <p>Hey there! I’m the face behind the screen and, more often than not, the person frantically trying to fit one last souvenir into an overhead bin.</p>
                    <p>I started this site because I believe travel shouldn't just be about checking boxes on a "Top 10" list. It’s about that specific feeling of being completely lost in a new city and realizing you’ve never felt more at home. For me, the magic is in the details, the smell of a morning market, the way the light hits a hidden alleyway at 4:00 PM, and the stories we tell through the lens once we get back.</p>
                    <p>I’ve spent years navigating the chaos of travel, from delayed trains to finding those quiet, "how is nobody else here?" spots that make a trip unforgettable. This website is my digital scrapbook and toolkit, designed to help you skip the tourist traps and get straight to the good stuff.</p>
                    <p>Whether you’re looking for a meticulously planned itinerary or just a single cinematic hook to inspire your next project, I’m here to help you see the world a little differently.</p>
                  </div>
                  <p className="about-copy__signoff">Let's find somewhere new to go.</p>
                </div>
                <div className="about-visual">
                  <div className="about-portrait">
                    <img src="https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=90&w=1600" alt="A traveler pausing with luggage beside a sunlit street, ready for the next route." />
                    <div className="about-note">
                      <span className="about-note__title">What This Is</span>
                      <p>A digital scrapbook for slow travel, cinematic routes, and the places that still feel personal when the internet has already been there first.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
      
            <footer className="footer">
              <div className="footer__left">
                <div className="footer__brand">Smiles and <span>Postcards</span> © 2026</div>
                <p className="footer__note">Editorial travel stories, practical route planning, and slower itineraries for people who want the place to feel real.</p>
              </div>
              <div className="footer__right">
                <div className="footer__eyebrow">Legal</div>
                <div className="footer__links">
                  <a href="#privacy-policy" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="privacy_policy" onClick={(event) => handleNavigate(event, 'privacy-policy')}>Privacy Policy</a>
                  <a href="#terms-and-conditions" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="terms_and_conditions" onClick={(event) => handleNavigate(event, 'terms-and-conditions')}>Terms &amp; Conditions</a>
                  <a href="#cookie-consent" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="cookie_consent" onClick={(event) => handleNavigate(event, 'cookie-consent')}>Cookie Consent</a>
                </div>
              </div>
            </footer>
          </div>
        </section>
      </div>
      
      {/*═══════════════ RECOMMENDATIONS PAGE ═══════════════*/}
      <div className="page" id="page-recommendations">
        <section className="reco-access reco-access__gate is-hidden" id="recommendations-gate">
          <div className="reco-access__card reveal">
            <div className="reco-access__eyebrow">Members Only</div>
            <h1 className="reco-access__title">Sign in with Google to unlock recommendation routes.</h1>
            <p className="reco-access__text">The recommendation library is gated behind Firebase Google login. Once you are signed in, the curated lanes and ranked city pages become available.</p>
            <div className="reco-access__actions">
              <button className="search__btn" type="button" onClick={() => callSite('signInWithGoogle')}>Continue with Google</button>
              <button className="hero__quicklink" type="button" onClick={(event) => handleNavigate(event, 'home')}>Back to stories</button>
            </div>
            <p className="reco-access__status" id="recommendations-gate-status">You need to be signed in to continue.</p>
          </div>
        </section>
      
        <section className="reco-page reco-access__content" id="recommendations-content">
          <div className="reco-hero reveal">
            <div className="reco-hero__copy">
              <span className="reco-hero__tag">Curated routes</span>
              <h1 className="reco-hero__title">Start with a mood.<br />Then follow the route.</h1>
              <p className="reco-hero__text">These recommendation lanes group together recurring travel intentions such as budget Europe, food-first Asia, romantic escapes, and digital nomad hubs. Each one resolves to ranked itineraries already waiting in the city library.</p>
            </div>
            <div className="reco-hero__note">
              <h2 className="section-title" style={{ color: '#fff' }}>Editorial discovery, not booking noise</h2>
              <p>Instead of front-loading complexity, we begin with recognizable travel moods and let readers move into ranked city picks when they are ready.</p>
            </div>
          </div>
      
          <div className="reco-shell reveal">
            <aside className="reco-shell__sidebar">
              <h2 className="reco-sidebar__title">Recommendation sets</h2>
              <p className="reco-sidebar__hint">Choose a travel lane and we will open the ranked cities already attached to complete itinerary pages.</p>
              <div className="reco-mobile-picker">
                <label className="reco-mobile-picker__label" htmlFor="recommendation-select">Choose a route</label>
                <select className="reco-mobile-picker__select" id="recommendation-select" onChange={(event) => callSite('setRecommendation', event.currentTarget.value)}></select>
              </div>
              <div className="reco-intent-grid" id="recommendation-grid"></div>
            </aside>
      
            <section className="reco-shell__content">
              <div id="recommendation-detail"></div>
            </section>
          </div>
        </section>
      
        <footer className="footer">
          <div className="footer__left">
            <div className="footer__brand">Smiles and <span>Postcards</span> © 2026</div>
            <p className="footer__note">Editorial travel stories, practical route planning, and slower itineraries for people who want the place to feel real.</p>
          </div>
          <div className="footer__right">
            <div className="footer__eyebrow">Legal</div>
            <div className="footer__links">
              <a href="#privacy-policy" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="privacy_policy" onClick={(event) => handleNavigate(event, 'privacy-policy')}>Privacy Policy</a>
              <a href="#terms-and-conditions" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="terms_and_conditions" onClick={(event) => handleNavigate(event, 'terms-and-conditions')}>Terms &amp; Conditions</a>
              <a href="#cookie-consent" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="cookie_consent" onClick={(event) => handleNavigate(event, 'cookie-consent')}>Cookie Consent</a>
            </div>
          </div>
        </footer>
      </div>
      
      {/*═══════════════ BLOG DETAIL PAGE ═══════════════*/}
      <div className="page" id="page-blog"></div>
      
      <div className="cookie-banner is-hidden" id="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
        <div>
          <div className="cookie-banner__title">Analytics cookies</div>
          <p className="cookie-banner__text">We use Firebase Analytics to understand visits and clicks. Accept to enable analytics, or decline to keep non-essential tracking off. You can still read the full details on the cookie page.</p>
        </div>
        <div className="cookie-banner__actions">
          <button className="cookie-banner__btn cookie-banner__btn--accept" type="button" onClick={() => callSite('acceptCookieConsent')}>Accept analytics</button>
          <button className="cookie-banner__btn cookie-banner__btn--decline" type="button" onClick={() => callSite('declineCookieConsent')}>Decline</button>
        </div>
      </div>
      
      {/*═══════════════ LEGAL PAGES ═══════════════*/}
      <div className="page" id="page-privacy-policy">
        <section className="legal-page">
          <div className="legal-shell">
            <div className="legal-hero reveal">
              <div className="legal-hero__card">
                <span className="legal-kicker">Privacy Policy</span>
                <h1 className="legal-title">How Smiles and Postcards handles visitor data.</h1>
                <p className="legal-intro">This page explains what information may be collected when someone uses the site, why it is collected, and how it is used to keep the experience functional, measurable, and easier to improve.</p>
              </div>
              <aside className="legal-summary">
                <div className="legal-summary__label">Last Updated</div>
                <div className="legal-summary__value">May 15, 2026</div>
                <p>Questions about privacy can be routed through the site contact channel before any personal request is processed.</p>
              </aside>
            </div>
      
            <div className="legal-grid reveal">
              <section className="legal-panel">
                <h2>What may be collected</h2>
                <div className="legal-highlight-list">
                  <div className="legal-highlight"><strong>Usage data</strong><span>Page views, route changes, and interaction events such as clicks on navigation, cards, and calls to action.</span></div>
                  <div className="legal-highlight"><strong>Technical data</strong><span>Browser, device, language, referring page, and approximate location inferred from IP by platform providers.</span></div>
                  <div className="legal-highlight"><strong>Optional input</strong><span>Information visitors choose to submit in forms, search boxes, or account areas.</span></div>
                </div>
              </section>
      
              <section className="legal-panel">
                <h2>How that information is used</h2>
                <ul>
                  <li>To understand which pages, stories, and recommendation paths are actually helpful to readers.</li>
                  <li>To maintain site reliability, prevent abuse, and debug broken flows.</li>
                  <li>To improve editorial decisions, search experiences, and navigation over time.</li>
                </ul>
              </section>
      
              <section className="legal-panel">
                <h2>Analytics and third-party services</h2>
                <p>The site uses Firebase services, including analytics, to measure usage and understand behavior patterns such as page visits and interaction events. Third-party providers may process technical information needed to deliver hosting, storage, and analytics features.</p>
                <p>Collected information is used in aggregate wherever possible and is not intended to identify a visitor personally unless that visitor explicitly provides personal information through a separate contact or account workflow.</p>
              </section>
      
              <section className="legal-panel">
                <h2>Retention and requests</h2>
                <p>Data is retained only for as long as it is reasonably useful for security, product improvement, legal compliance, or support. If a visitor wants to ask about access, correction, or deletion of personal information they submitted directly, they should use the site’s contact method and include enough context for the request to be verified.</p>
              </section>
            </div>
          </div>
      
          <footer className="footer">
            <div className="footer__left">
              <div className="footer__brand">Smiles and <span>Postcards</span> © 2026</div>
              <p className="footer__note">Editorial travel stories, practical route planning, and slower itineraries for people who want the place to feel real.</p>
            </div>
            <div className="footer__right">
              <div className="footer__eyebrow">Legal</div>
              <div className="footer__links">
                <a href="#privacy-policy" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="privacy_policy" onClick={(event) => handleNavigate(event, 'privacy-policy')}>Privacy Policy</a>
                <a href="#terms-and-conditions" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="terms_and_conditions" onClick={(event) => handleNavigate(event, 'terms-and-conditions')}>Terms &amp; Conditions</a>
                <a href="#cookie-consent" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="cookie_consent" onClick={(event) => handleNavigate(event, 'cookie-consent')}>Cookie Consent</a>
              </div>
            </div>
          </footer>
        </section>
      </div>
      
      <div className="page" id="page-terms-and-conditions">
        <section className="legal-page">
          <div className="legal-shell">
            <div className="legal-hero reveal">
              <div className="legal-hero__card">
                <span className="legal-kicker">Terms &amp; Conditions</span>
                <h1 className="legal-title">The basic rules for using Smiles and Postcards.</h1>
                <p className="legal-intro">These terms explain what this site offers, what visitors can reasonably rely on, and the boundaries around editorial content, third-party links, and acceptable use.</p>
              </div>
              <aside className="legal-summary">
                <div className="legal-summary__label">Last Updated</div>
                <div className="legal-summary__value">May 15, 2026</div>
                <p>Using the site means accepting the current terms in effect at the time of access.</p>
              </aside>
            </div>
      
            <div className="legal-grid reveal">
              <section className="legal-panel">
                <h2>Editorial use only</h2>
                <p>Travel guides, recommendations, budgets, and seasonal suggestions are provided for informational and editorial purposes. They are not guarantees of availability, pricing, safety, or suitability for any specific traveler or situation.</p>
              </section>
      
              <section className="legal-panel">
                <h2>Use of the site</h2>
                <ul>
                  <li>Do not misuse the site, interfere with its operation, or attempt to access restricted systems without authorization.</li>
                  <li>Do not copy, scrape, republish, or redistribute substantial site content in a way that misrepresents ownership or authorship.</li>
                  <li>Do not rely on the site as a substitute for local laws, travel advisories, visa guidance, or emergency planning.</li>
                </ul>
              </section>
      
              <section className="legal-panel">
                <h2>Third-party content and links</h2>
                <p>The site may reference external services, images, locations, businesses, or tools. Those third parties operate independently, and Smiles and Postcards is not responsible for their availability, content, pricing, or privacy practices.</p>
              </section>
      
              <section className="legal-panel">
                <h2>Changes and availability</h2>
                <p>Content, features, routes, and data sources may change without notice. The site may be updated, paused, or removed at any time, especially while editorial systems, recommendations, or analytics infrastructure are still evolving.</p>
              </section>
            </div>
          </div>
      
          <footer className="footer">
            <div className="footer__left">
              <div className="footer__brand">Smiles and <span>Postcards</span> © 2026</div>
              <p className="footer__note">Editorial travel stories, practical route planning, and slower itineraries for people who want the place to feel real.</p>
            </div>
            <div className="footer__right">
              <div className="footer__eyebrow">Legal</div>
              <div className="footer__links">
                <a href="#privacy-policy" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="privacy_policy" onClick={(event) => handleNavigate(event, 'privacy-policy')}>Privacy Policy</a>
                <a href="#terms-and-conditions" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="terms_and_conditions" onClick={(event) => handleNavigate(event, 'terms-and-conditions')}>Terms &amp; Conditions</a>
                <a href="#cookie-consent" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="cookie_consent" onClick={(event) => handleNavigate(event, 'cookie-consent')}>Cookie Consent</a>
              </div>
            </div>
          </footer>
        </section>
      </div>
      
      <div className="page" id="page-cookie-consent">
        <section className="legal-page">
          <div className="legal-shell">
            <div className="legal-hero reveal">
              <div className="legal-hero__card">
                <span className="legal-kicker">Cookie Consent</span>
                <h1 className="legal-title">What cookies do here, and how consent is meant to work.</h1>
                <p className="legal-intro">This page explains the categories of cookies or similar technologies the site may use, what each category supports, and what visitors should understand before optional analytics are enabled.</p>
              </div>
              <aside className="legal-summary">
                <div className="legal-summary__label">Last Updated</div>
                <div className="legal-summary__value">May 15, 2026</div>
                <p>Essential cookies may be required for core site operation. Optional analytics should only be enabled after a clear visitor choice.</p>
              </aside>
            </div>
      
            <div className="legal-grid reveal">
              <section className="legal-panel">
                <h2>Cookie categories</h2>
                <div className="legal-highlight-list">
                  <div className="legal-highlight"><strong>Essential</strong><span>Required for routing, basic functionality, security, and remembering core interface state.</span></div>
                  <div className="legal-highlight"><strong>Analytics</strong><span>Used to understand visits, clicks, and engagement patterns so the site can improve.</span></div>
                  <div className="legal-highlight"><strong>Preference</strong><span>May remember user choices such as interface behavior, dismissed prompts, or filtering preferences.</span></div>
                </div>
              </section>
      
              <section className="legal-panel">
                <h2>Consent expectations</h2>
                <p>Visitors should be told, in plain language, what optional tracking is used and what happens if they accept or decline. Consent should be recorded before non-essential analytics or marketing technologies are activated.</p>
              </section>
      
              <section className="legal-panel">
                <h2>Managing preferences</h2>
                <p>Visitors can clear or block cookies through browser controls. If a consent management interface is present in the future, it should allow people to revisit or change their choice without friction.</p>
              </section>
      
              <section className="legal-panel">
                <h2>Current implementation note</h2>
                <p>The site now uses a live consent banner for analytics choices. If a broader preference center is added later, this page should stay aligned with the actual behavior implemented in the product.</p>
              </section>
            </div>
          </div>
      
          <footer className="footer">
            <div className="footer__left">
              <div className="footer__brand">Smiles and <span>Postcards</span> © 2026</div>
              <p className="footer__note">Editorial travel stories, practical route planning, and slower itineraries for people who want the place to feel real.</p>
            </div>
            <div className="footer__right">
              <div className="footer__eyebrow">Legal</div>
              <div className="footer__links">
                <a href="#privacy-policy" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="privacy_policy" onClick={(event) => handleNavigate(event, 'privacy-policy')}>Privacy Policy</a>
                <a href="#terms-and-conditions" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="terms_and_conditions" onClick={(event) => handleNavigate(event, 'terms-and-conditions')}>Terms &amp; Conditions</a>
                <a href="#cookie-consent" data-track-event="navigation_click" data-track-param-location="footer" data-track-param-label="cookie_consent" onClick={(event) => handleNavigate(event, 'cookie-consent')}>Cookie Consent</a>
              </div>
            </div>
          </footer>
        </section>
      </div>
      
    </>
  );
}
