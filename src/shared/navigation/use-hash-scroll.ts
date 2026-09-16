import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Brings the element named by the URL fragment into view, for a page whose content is always
 * present at mount — unlike `useSectionAnchor` in the terms feature, which exists because that
 * page's content arrives after an API call. A browser resolves `#id` only on a real page load,
 * so a client-side navigation into `/#courses` or `/privacy#section-3` from another page would
 * otherwise land at the top and never scroll.
 *
 * Once per navigation: each history entry scrolls at most once, so a re-render does not fight
 * a visitor who has since scrolled elsewhere.
 */
export function useHashScroll(): void {
  const location = useLocation();
  const scrolledFor = useRef<string | null>(null);

  useEffect(() => {
    if (location.hash.length < 2) return;

    const navigation = `${location.key}${location.hash}`;
    if (scrolledFor.current === navigation) return;

    let id: string;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const target = window.document.getElementById(id);
      if (!target) return;
      scrolledFor.current = navigation;
      target.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "instant" : "auto" });
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.key, location.hash]);
}
