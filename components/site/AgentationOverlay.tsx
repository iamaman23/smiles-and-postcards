"use client";

import dynamic from "next/dynamic";

const AgentationToolbar = dynamic(
  () => import("agentation").then((mod) => mod.Agentation),
  { ssr: false }
);

export function AgentationOverlay() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return <AgentationToolbar />;
}
