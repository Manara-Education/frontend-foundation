/**
 * The application's breakpoints — one definition, for CSS and for TypeScript.
 *
 * These are Tailwind's own values, not a new scale. Tailwind v4 is installed, its Vite
 * plugin is active, and seventeen files already reason in `sm:` / `md:` / `lg:`, so a
 * second set of numbers would mean a component's class prefix and its `useMediaQuery`
 * call could disagree about where the phone ends. They cannot disagree if there is one
 * set of numbers.
 *
 * What this replaces is the four hand-rolled breakpoints that had accumulated in feature
 * code — 900, 1024, 820 and 640, each written inside a different injected `<style>`
 * string, none of them referring to the others.
 *
 * Prefer plain CSS to a breakpoint wherever the layout can decide for itself: `minmax()`,
 * `auto-fit`, `clamp()`, `flex-wrap` and intrinsic sizing all reflow continuously, and a
 * layout that reflows continuously is correct *between* the validation widths as well as
 * at them. Reach for a breakpoint when the DOM itself has to change — a sidebar becoming
 * a drawer — not to pick a padding.
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/** `(min-width: …)` — this breakpoint and wider. Matches Tailwind's `md:` semantics. */
export function up(breakpoint: Breakpoint): string {
  return `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
}

/**
 * `(max-width: …)` — strictly narrower than this breakpoint.
 *
 * The 0.02px is deliberate: at exactly 768px `up("md")` must match and `down("md")` must
 * not, or a layout at the boundary renders both branches or neither. Subtracting a whole
 * pixel would leave fractional widths — which zoom and some devices really do produce —
 * matching nothing at all.
 */
export function down(breakpoint: Breakpoint): string {
  return `(max-width: ${BREAKPOINTS[breakpoint] - 0.02}px)`;
}
