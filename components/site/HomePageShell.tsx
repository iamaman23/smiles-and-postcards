import { type TravelBlog } from "../../lib/site-content";
import { HomePageExperience } from "./HomePageExperience";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

export function HomePageShell({ stories }: { stories: TravelBlog[] }) {
  return (
    <>
      <SiteNav />
      <HomePageExperience stories={stories} />
      <SiteFooter />
    </>
  );
}
