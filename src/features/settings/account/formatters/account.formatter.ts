/** The longest name the server stores, in UTF-16 code units — the unit `@Size` counts. */
export const FULL_NAME_MAX_LENGTH = 70;

/**
 * Up to two letters for the avatar: the first letter of the first and the last word.
 *
 * Counted in code points so a name starting with an emoji or a surrogate pair is not split in
 * half. A name with no letters at all falls back to a neutral mark rather than an empty circle.
 */
export function initialsOf(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "؟";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return `${first}${last}`.toLocaleUpperCase("ar") || "؟";
}

/** The rule the server applies to a new name, with the same trimming and the same counting. */
export function nameError(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "الاسم الكامل مطلوب.";
  if (trimmed.length > FULL_NAME_MAX_LENGTH) {
    return `يجب ألا يزيد الاسم الكامل على ${FULL_NAME_MAX_LENGTH} حرفًا.`;
  }
  return undefined;
}

/** A 0–4 strength score from how many of the shared password rules are met. */
export function strengthLabel(met: number, total: number): string {
  if (met === 0) return "";
  if (met < total / 2) return "ضعيفة";
  if (met < total) return "متوسطة";
  return "قوية";
}
