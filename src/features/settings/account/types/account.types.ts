/* ── API types (mirror backend DTOs) ─────────────────────── */

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/* ── Domain/view shapes ───────────────────────────────────── */

/** What the account screen shows. Anything the server does not report is absent, never guessed. */
export interface AccountOverview {
  fullName: string;
  initials: string;
  email: string;
  roleLabel: string;
  memberSince: string;
}

export type LoadState = "loading" | "ready" | "error";
export type SaveState = "idle" | "saving" | "error";

export interface NameEditorErrors {
  fullName?: string;
  general?: string;
}

export interface PasswordEditorErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export type PasswordFieldId = "currentPassword" | "newPassword" | "confirmPassword";

/** One notice the overview shows after an editor closes with a saved change. */
export type AccountNotice = "name-saved" | "password-changed";
