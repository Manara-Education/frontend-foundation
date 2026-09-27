/**
 * Up to two letters for an avatar: the first letter of the first and the last word.
 *
 * Counted in code points so a name starting with an emoji or a surrogate pair is not split in
 * half. A name with no letters at all falls back to a neutral mark rather than an empty circle.
 */
export function initialsOf(fullName: string | null | undefined): string {
  const words = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "؟";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(withoutArticle(words[words.length - 1]))[0] ?? "") : "";
  return `${first}${last}`.toLocaleUpperCase("ar") || "؟";
}

/** "السيد" → "سيد": the Arabic article would make every such initial an alif. */
function withoutArticle(word: string): string {
  return word.startsWith("ال") && Array.from(word).length > 3 ? word.slice(2) : word;
}
