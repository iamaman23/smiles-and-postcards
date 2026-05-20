"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type SiteNavigateHandler = (page: string, param?: string) => void;

declare global {
  interface Window {
    __siteNavigate?: SiteNavigateHandler;
  }
}

export function HomePageNavigationBridge() {
  const router = useRouter();

  useEffect(() => {
    const prefetched = new Set<string>();
    const prefetchDestinationLinks = () => {
      document.querySelectorAll<HTMLAnchorElement>('a[href^="/destination/"]').forEach((anchor) => {
        const href = anchor.getAttribute("href");
        if (!href || prefetched.has(href)) return;
        prefetched.add(href);
        router.prefetch(href);
      });
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="/destination/"]');
      const href = anchor?.getAttribute("href");
      if (!anchor || !href || anchor.target) return;
      event.preventDefault();
      router.push(href);
    };

    window.__siteNavigate = (page, param) => {
      if (page === "home") {
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      if (page === "blog" && param) {
        const target = param.toString().trim();
        router.push(
          target.startsWith("/")
            ? target
            : `/stories/${target.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`
        );
        return;
      }

      if (page === "recommendations") {
        router.push(param ? `/recommendations/${param}` : "/recommendations");
        return;
      }

      if (page === "about") {
        router.push("/about");
        return;
      }

      if (["privacy-policy", "terms-and-conditions", "cookie-consent"].includes(page)) {
        router.push(`/${page}`);
      }
    };

    prefetchDestinationLinks();
    const mutationObserver = new MutationObserver(prefetchDestinationLinks);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", handleDocumentClick);

    return () => {
      delete window.__siteNavigate;
      mutationObserver.disconnect();
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [router]);

  return null;
}
