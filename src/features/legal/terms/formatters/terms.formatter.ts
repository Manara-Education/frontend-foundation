/**
 * The effective date, written for an Arabic reader.
 *
 * Returns the input untouched when it is not a date the runtime can parse. The date is
 * metadata about a legal document, so an unreadable value is shown as it arrived rather
 * than replaced with a guess or hidden.
 */
export function formatEffectiveDate(iso: string): string {
  if (!iso) return "";

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;

  return parsed.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
