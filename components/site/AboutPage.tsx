import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

export function AboutPage() {
  return (
    <>
      <SiteNav />
      <main className="legal-page">
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
                <p className="about-copy__signoff">Let&apos;s find somewhere new to go.</p>
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
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
