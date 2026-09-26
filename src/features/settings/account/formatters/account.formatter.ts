/** The longest name the server stores, in UTF-16 code units — the unit `@Size` counts. */
export const FULL_NAME_MAX_LENGTH = 70;

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
