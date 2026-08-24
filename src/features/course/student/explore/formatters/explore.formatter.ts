/**
 * The palette, shimmer and number formatting the three explore components share.
 *
 * They were three copies of the same constants before the tile redesign, which is one
 * copy per file to keep in step every time the card, the grid and the skeleton have to
 * agree on a colour — and they now have to agree on considerably more of them.
 */
export const PRIMARY = "#4E5B92";
export const PRIMARY_SOFT = "#6B7AB8";
export const FONT = "'Cairo', sans-serif";
export const TEXT_DARK = "#1F2937";
export const TEXT_BODY = "#6B7280";
export const TEXT_MUTE = "#9BA3C4";
export const ICON_MUTE = "#B0B7D4";
export const BORDER = "#ECECEC";
export const BORDER_HOVER = "rgba(78,91,146,0.18)";

/** Egyptian Arabic, the locale every other course surface prints its numbers in. */
const NUMBER_LOCALE = "ar-EG";

/**
 * A course's length, from the minutes the backend stores.
 *
 * The number is the API's; only the wording is this screen's. Nothing here reads a
 * pre-formatted duration string, because no endpoint sends one.
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}س ${mins}د` : `${hours} ساعة`;
  }
  return `${mins} دقيقة`;
}

/** The enrolled-learner count, as the meta row prints it: `"٤٬٣٢٠"`. */
export function formatStudentsCount(count: number): string {
  return count.toLocaleString(NUMBER_LOCALE);
}

/** A one-off price with its currency, the same way the course details screen reads it. */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString(NUMBER_LOCALE)} ج.م`;
}
