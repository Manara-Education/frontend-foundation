import { useCallback, useSyncExternalStore } from "react";
import { down, up, type Breakpoint } from "./breakpoints";

/**
 * Whether a media query matches, kept in step with the viewport.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`, because the effect-based
 * form — which is what `shared/components/use-mobile.ts` does — returns the desktop
 * answer on the very first render and corrects itself afterwards. On a phone that is a
 * visible flash of the desktop layout, and worse, a shell that mounts the sidebar and
 * then swaps it for a drawer runs both mount paths on every load. Reading `matchMedia`
 * synchronously during render means the first paint is already right.
 *
 * The server snapshot returns `false` so a query is never "matching" where there is no
 * window to measure. There is no SSR here today; this is what keeps that true if it ever
 * changes, rather than throwing.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** True at this breakpoint and wider. `useBreakpointUp("md")` is Tailwind's `md:`. */
export function useBreakpointUp(breakpoint: Breakpoint): boolean {
  return useMediaQuery(up(breakpoint));
}

/** True strictly below this breakpoint. */
export function useBreakpointDown(breakpoint: Breakpoint): boolean {
  return useMediaQuery(down(breakpoint));
}

/**
 * Below `md` (768px) — the width at which this application stops having room for a
 * persistent 280px sidebar beside its content.
 *
 * Use it for the handful of places where the DOM genuinely differs: a drawer instead of a
 * sidebar, a bottom sheet instead of a centred dialog. It is not for choosing a font size
 * or a gap — CSS does that better, continuously, and without a re-render.
 */
export function useIsMobile(): boolean {
  return useBreakpointDown("md");
}
