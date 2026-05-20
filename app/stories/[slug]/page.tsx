import { notFound, redirect } from "next/navigation";
import { getDestinationPath, getStoryBySlug } from "../../../lib/site-content";

export const revalidate = 3600;

export default async function LegacyStoryRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) notFound();

  redirect(getDestinationPath(story));
}
