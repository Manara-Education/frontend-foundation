import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Edge state and paging for a horizontal scroll-snap track.
 *
 * Works in either writing direction: in RTL, `scrollLeft` starts at 0 and goes negative towards
 * the end, so the edges are measured on its magnitude and "next" scrolls by a negative amount.
 * There is no timer anywhere: the track moves only when the visitor moves it.
 */
export function useCourseCarousel(itemCount: number) {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const offset = Math.abs(track.scrollLeft);
    setAtStart(offset <= 2);
    setAtEnd(offset + track.clientWidth >= track.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    track.addEventListener("scroll", measure, { passive: true });
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resize?.observe(track);
    return () => {
      track.removeEventListener("scroll", measure);
      resize?.disconnect();
    };
  }, [measure, itemCount]);

  const page = useCallback((towardsEnd: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    const rtl = getComputedStyle(track).direction === "rtl";
    const step = Math.max(track.clientWidth * 0.9, 290);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: (towardsEnd === rtl ? -1 : 1) * step, behavior: reducedMotion ? "auto" : "smooth" });
  }, []);

  return { trackRef, atStart, atEnd, next: () => page(true), previous: () => page(false) };
}
