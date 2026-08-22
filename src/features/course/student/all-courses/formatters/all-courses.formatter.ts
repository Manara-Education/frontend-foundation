/**
 * Egyptian Arabic is what the cards print: `ar-EG` keeps the Gregorian calendar and the
 * month names the reference shows, where `ar-SA` would answer in Hijri.
 *
 * The date asks for Latin digits on top of it — `٦ مايو ٢٠٢٦` beside a Latin lesson count
 * reads as two different scripts in one row, and the reference's own date is `6 مايو 2026`.
 * Prices keep the locale's own digits, which is what the reference formats them with.
 */
const DATE_LOCALE = "ar-EG-u-nu-latn";
const PRICE_LOCALE = "ar-EG";

/** The card's "آخر تحديث" date. A course with no usable date prints an em dash. */
export function formatUpdatedAt(iso?: string | null): string {
  if (!iso) return "—";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(DATE_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** An amount on its own; the badge that shows it adds the currency. */
export function formatPrice(amount: number): string {
  return amount.toLocaleString(PRICE_LOCALE);
}
