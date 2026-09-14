import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router";
import type { TermsDocument } from "../types/terms.types";

/**
 * The section a URL fragment names, if the document actually has it.
 *
 * The fragment is untrusted input — anyone can hand out a link — so it is only ever compared
 * against the document's own section ids. It is never used as a CSS selector, never parsed
 * as HTML and never followed anywhere else. A malformed escape (`#%E0%A4%A`) or an id this
 * version does not have is simply not a section.
 */
export function sectionIdFromHash(hash: string, sectionIds: ReadonlySet<string>): string | null {
  if (hash.length < 2 || !hash.startsWith("#")) return null;

  let id: string;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
  return sectionIds.has(id) ? id : null;
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Brings the section named in the URL fragment into view — once the section exists.
 *
 * The terms arrive asynchronously: the page first asks the server which version is in force,
 * and only then renders that version's text. A browser resolves a fragment when the page
 * loads, finds no `#section-6` yet, and gives up, so opening or refreshing
 * `/terms#section-6` used to leave the reader at the top of the page. This waits for the
 * document to be rendered and then does what the browser could not.
 *
 * Once per navigation, and never again for it. Each history entry has its own key: a fresh
 * load, a link from the footer, a click in the contents, or a back/forward step each get
 * exactly one scroll. A re-render, a background refresh or a retry that renders the same
 * navigation again leaves the reader wherever they have scrolled to since.
 *
 * Keyboard focus follows the viewport to the section, as it does for an ordinary in-page
 * anchor, so a screen reader or keyboard user continues from the clause they were sent to.
 *
 * @param document the rendered terms, or `null` while nothing is on screen yet
 */
export function useSectionAnchor(document: TermsDocument | null): void {
  const location = useLocation();
  const scrolledFor = useRef<string | null>(null);

  const sectionIds = useMemo(
    () => (document ? new Set(document.sections.map((section) => section.id)) : null),
    [document],
  );

  useEffect(() => {
    if (!sectionIds) return;

    const navigation = `${location.key}${location.hash}`;
    if (scrolledFor.current === navigation) return;

    const id = sectionIdFromHash(location.hash, sectionIds);
    if (!id) return;

    // After the commit that mounted the sections, and cancelled if this navigation is
    // superseded or the page unmounts before it runs.
    const frame = window.requestAnimationFrame(() => {
      const target = window.document.getElementById(id);
      if (!target) return;
      scrolledFor.current = navigation;
      target.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "instant" : "auto" });
      // A <section> is not focusable by default. -1 lets it take focus without adding it to
      // the tab order, which is the usual way to give an anchor target keyboard focus.
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.key, location.hash, sectionIds]);
}
