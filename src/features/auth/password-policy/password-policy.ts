/**
 * The client's copy of the server's password length rules (backend `PasswordPolicy`), so they are
 * learned while typing instead of after a round trip. The server stays the authority: the list of
 * common and leaked passwords, and the check against the account's own address and name, live
 * only there, and its refusal is shown as it comes back.
 *
 * No composition rules. Upper case, digits and symbols are neither required nor rewarded — they
 * steer people towards `Password1!`, which every attacker tries first. Length is what counts.
 */

/** Counted in code points (`[...s]`), as the server counts them: an emoji is one, not two. */
export const PASSWORD_MIN_CHARACTERS = 15;

/** bcrypt uses at most 72 bytes of UTF-8. Arabic letters take two each; basic Latin, one. */
export const PASSWORD_MAX_BYTES = 72;

export function passwordCharacterCount(password: string): number {
  return [...password].length;
}

export function passwordByteCount(password: string): number {
  return new TextEncoder().encode(password).length;
}

export const PASSWORD_TOO_SHORT_MESSAGE = `يجب أن تتكون كلمة المرور من ${PASSWORD_MIN_CHARACTERS} حرفاً على الأقل`;

export const PASSWORD_TOO_LONG_MESSAGE =
  `كلمة المرور أطول من المسموح: الحد الأقصى ${PASSWORD_MAX_BYTES} بايت، ` +
  "والحرف العربي بايتان والحرف اللاتيني أو الرقم أو الرمز بايت واحد";

export const PASSWORD_GUIDANCE =
  "استخدم عبارة من عدة كلمات تفصل بينها مسافات، بالعربية أو بغيرها. لا نشترط أحرفاً كبيرة أو أرقاماً أو رموزاً، " +
  "وعند الحفظ نتحقق من أنها ليست من كلمات المرور المعروفة المتداولة.";

/** The first length rule the password breaks, as a message for its field; undefined if none. */
export function passwordLengthError(password: string): string | undefined {
  if (passwordCharacterCount(password) < PASSWORD_MIN_CHARACTERS) return PASSWORD_TOO_SHORT_MESSAGE;
  if (passwordByteCount(password) > PASSWORD_MAX_BYTES) return PASSWORD_TOO_LONG_MESSAGE;
  return undefined;
}

export interface PasswordLengthMeter {
  label: string;
  color: string;
  width: string;
}

/**
 * A meter of what the client can honestly measure: length. It never says "strong" — a long
 * password can still be on the server's list of common ones.
 */
export function passwordLengthMeter(password: string): PasswordLengthMeter | null {
  if (!password) return null;
  const characters = passwordCharacterCount(password);
  if (passwordByteCount(password) > PASSWORD_MAX_BYTES) {
    return { label: `أطول من الحد المسموح (${PASSWORD_MAX_BYTES} بايت)`, color: "#D4183D", width: "100%" };
  }
  if (characters < PASSWORD_MIN_CHARACTERS) {
    const width = `${Math.round((characters / PASSWORD_MIN_CHARACTERS) * 60)}%`;
    return { label: `قصيرة: ${characters} من ${PASSWORD_MIN_CHARACTERS} حرفاً`, color: "#D4183D", width };
  }
  if (characters < 20) return { label: "الطول كافٍ", color: "#4E5B92", width: "75%" };
  return { label: "طول جيد", color: "#27AE60", width: "100%" };
}
