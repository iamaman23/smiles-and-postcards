"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SiteChromeEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const nav = document.getElementById("nav");
    const observers = new Map<HTMLElement, IntersectionObserver>();

    const syncNav = () => {
      if (!nav) return;
      nav.classList.toggle("scrolled", window.scrollY > 60);
    };

    const revealNode = (node: HTMLElement) => {
      node.classList.add("visible");
      const observer = observers.get(node);
      observer?.disconnect();
      observers.delete(node);
    };

    const isInViewport = (node: HTMLElement) => {
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      return visibleHeight >= Math.min(rect.height * 0.15, 120);
    };

    const observeRevealNode = (node: HTMLElement) => {
      if (node.classList.contains("visible")) return;
      if (isInViewport(node) || !("IntersectionObserver" in window)) {
        revealNode(node);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) revealNode(entry.target as HTMLElement);
          });
        },
        { threshold: 0.15 }
      );

      observers.set(node, observer);
      observer.observe(node);
    };

    const refreshRevealNodes = () => {
      document.querySelectorAll<HTMLElement>(".reveal").forEach(observeRevealNode);
    };

    syncNav();
    refreshRevealNodes();

    const mutationObserver = new MutationObserver(() => {
      refreshRevealNodes();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener("scroll", syncNav, { passive: true });
    return () => {
      window.removeEventListener("scroll", syncNav);
      mutationObserver.disconnect();
      observers.forEach((observer) => observer.disconnect());
      observers.clear();
    };
  }, [pathname]);

  return null;
}
