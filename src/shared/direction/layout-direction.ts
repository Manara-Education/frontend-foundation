/**
 * Which way the layout runs — and the two things CSS logical properties cannot express.
 *
 * Almost every direction-sensitive rule in this application should be written logically:
 * `padding-inline`, `inset-inline-start`, `border-inline-end`. Those resolve against the
 * nearest `dir`, so they are already correct in both directions and need nothing from this
 * file.
 *
 * Two things are not like that:
 *
 *  1. **Transforms are physical.** `translateX(100%)` moves right in Arabic exactly as it
 *     moves right in English; there is no `translate-inline`. A drawer that slides in from
 *     the side it lives on therefore has to be told which way that is. This is what broke:
 *     the shell animated `x: "100%"` unconditionally, which is a statement about the screen
 *     and not about the navigation.
 *
 *  2. **Shadow and offset geometry is physical.** `box-shadow` takes an x-offset in pixels,
 *     and a panel's shadow should fall across the content it sits over — which is the left
 *     in Arabic and the right in English.
 *
 * So the rule for the navigation shell is: use a logical CSS property wherever one exists,
 * and where one does not, derive the physical value from `LayoutDirection` here rather than
 * assuming Arabic. That is the whole difference between a layout that mirrors and a layout
 * that has "sidebar = right" written into it in a dozen places.
 */

export type LayoutDirection = "rtl" | "ltr";

/**
 * What the layout runs as when nothing has said otherwise.
 *
 * Manara is Arabic-first — `index.html` ships `<html lang="ar" dir="rtl">` — so an absent
 * `dir` means "nobody has said", and the answer to that here is RTL. Anything that wants
 * LTR says so, either on the document or through `DirectionProvider`.
 */
export const DEFAULT_DIRECTION: LayoutDirection = "rtl";

/**
 * Narrows whatever a `dir` attribute happens to hold to a direction we can lay out with.
 *
 * `dir` is also allowed to be `auto`, and to be missing, and to be misspelt. None of those
 * are a direction, so they come back as `null` and the caller decides what to fall back to
 * rather than this quietly guessing.
 */
export function toLayoutDirection(value: string | null | undefined): LayoutDirection | null {
  const normalised = value?.trim().toLowerCase();
  return normalised === "rtl" || normalised === "ltr" ? normalised : null;
}

/** The direction the document is currently declaring, or {@link DEFAULT_DIRECTION}. */
export function readDocumentDirection(): LayoutDirection {
  if (typeof document === "undefined") return DEFAULT_DIRECTION;
  return toLayoutDirection(document.documentElement.getAttribute("dir")) ?? DEFAULT_DIRECTION;
}

/**
 * The sign that turns a distance measured along the *inline* axis into a physical X.
 *
 * `+1` in LTR, where inline-end is to the right; `-1` in RTL, where it is to the left.
 */
export function inlineAxisSign(direction: LayoutDirection): 1 | -1 {
  return direction === "rtl" ? -1 : 1;
}

/**
 * A physical X offset for a distance measured *toward the inline-end edge*.
 *
 * `towardInlineEnd("rtl", 4)` is `-4`: in Arabic, inline-end is the left.
 */
export function towardInlineEnd(direction: LayoutDirection, distance: number): number {
  return distance * inlineAxisSign(direction);
}

/**
 * Where a panel resting flush against the inline-start edge sits when it is fully
 * off-screen — the value a drawer animates *from*, and back *to* when it closes.
 *
 * Expressed as a percentage of the panel's own width, so it is right at any drawer width
 * and needs no measurement:
 *
 *     RTL  closed → translateX(+100%)   (off past the right edge)
 *     LTR  closed → translateX(-100%)   (off past the left edge)
 *
 * The bug this replaces was a hard-coded `100%` paired with an `inset-inline-end` anchor,
 * which in RTL resolves to `left: 0` — so the drawer flew in from mid-screen and parked on
 * the left while the button that opened it stayed on the right.
 */
export function offscreenInlineStart(direction: LayoutDirection): "100%" | "-100%" {
  return direction === "rtl" ? "100%" : "-100%";
}
