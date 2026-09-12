import type { ApiError } from "@/shared/api";

/**
 * The password rules, for every screen that sets a password: registration, the emailed-code reset,
 * and the change a flagged account is sent to make. One list, so the checklist a person ticks off
 * while typing and the check made on submit cannot drift apart.
 *
 * A copy of the server's rules (backend `PasswordPolicy`), kept identical on purpose: the same four
 * requirements, tested with the same patterns, in the same order, refused in the same Arabic words.
 * The server stays the authority. It also refuses common and leaked passwords and ones built from
 * the account's own address or name, which only it can check, and that refusal is shown as it
 * comes back.
 */

export const PASSWORD_MIN_LENGTH = 15;

/**
 * The most the server can store. Never shown as a number: to a person it is only "too long", which
 * in practice means more than 72 Latin or 36 Arabic characters.
 */
const PASSWORD_MAX_BYTES = 72;

const UPPERCASE = /[A-Z]/;
const NUMBER = /[0-9]/;
/** Punctuation or a symbol in any script — `!`, `؟`, `€`, an emoji — exactly the server's `[\p{P}\p{S}]`. */
const SYMBOL = /[\p{P}\p{S}]/u;

export type PasswordRequirementId = "minimumLength" | "hasUppercase" | "hasNumber" | "hasSymbol";

export interface PasswordRequirement {
  id: PasswordRequirementId;
  /** The checklist line. */
  label: string;
  /** The refusal, worded exactly as the server words it. */
  message: string;
  isMet: (password: string) => boolean;
}

export const PASSWORD_REQUIREMENTS_TITLE = "متطلبات كلمة المرور:";

/** In the order the server checks them, so a refusal names the same requirement on both sides. */
export const PASSWORD_REQUIREMENTS: readonly PasswordRequirement[] = [
  {
    id: "minimumLength",
    label: `${PASSWORD_MIN_LENGTH} حرفًا على الأقل`,
    message: `يجب أن تتكون كلمة المرور من ${PASSWORD_MIN_LENGTH} حرفًا على الأقل.`,
    // Code points, as the server counts them: an emoji is one character, not two.
    isMet: (password) => [...password].length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "hasUppercase",
    label: "حرف إنجليزي كبير واحد على الأقل",
    message: "يجب أن تحتوي كلمة المرور على حرف إنجليزي كبير واحد على الأقل.",
    isMet: (password) => UPPERCASE.test(password),
  },
  {
    id: "hasNumber",
    label: "رقم واحد على الأقل",
    message: "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.",
    isMet: (password) => NUMBER.test(password),
  },
  {
    id: "hasSymbol",
    label: "رمز خاص واحد على الأقل",
    message: "يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل.",
    isMet: (password) => SYMBOL.test(password),
  },
];

export const PASSWORD_TOO_LONG_MESSAGE = "كلمة المرور طويلة جدًا. يرجى اختيار كلمة مرور أقصر.";

export type PasswordPolicyState = Record<PasswordRequirementId, boolean>;

/** Which requirements the password meets, by name. */
export function evaluatePassword(password: string): PasswordPolicyState {
  return Object.fromEntries(
    PASSWORD_REQUIREMENTS.map((requirement) => [requirement.id, requirement.isMet(password)]),
  ) as PasswordPolicyState;
}

/** The first rule the password breaks, as the message for its field; undefined if it breaks none. */
export function passwordPolicyError(password: string): string | undefined {
  const unmet = PASSWORD_REQUIREMENTS.find((requirement) => !requirement.isMet(password));
  if (unmet) return unmet.message;
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) return PASSWORD_TOO_LONG_MESSAGE;
  return undefined;
}

/**
 * The server's refusal of the new password, when that is what came back. Validation errors arrive
 * as "<field>: <message>"; the message is already in Arabic, because every request asks for Arabic,
 * so only the field name — the API's, not the reader's — is taken off.
 */
export function passwordRefusal(error: ApiError, field: "password" | "newPassword"): string | undefined {
  const prefix = `${field}: `;
  return error.errors.find((message) => message.startsWith(prefix))?.slice(prefix.length);
}
