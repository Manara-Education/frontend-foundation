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
  avatarUrl: string | null;
  emailVerified: boolean;
  /** Shown only when the server knows it. */
  passwordChangedOn: string | null;
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
export type AccountNotice = "name-saved" | "password-changed" | "email-changed";

/* ── Email change ─────────────────────────────────────────── */

export interface EmailChangeStartRequest {
  currentPassword: string;
  newEmail: string;
}

export interface EmailChangeChallengeResponse {
  requestId: string;
  maskedEmail: string;
  codeLength: number;
  expiresAt: string;
  resendAvailableAt: string;
  /** Relative to the server's clock at response time; preferred over the zone-less timestamps. */
  expiresInSeconds?: number;
  resendAvailableInSeconds?: number;
}

/** A challenge with its deadlines on this device's clock (epoch milliseconds). */
export interface EmailChallenge {
  requestId: string;
  maskedEmail: string;
  codeLength: number;
  expiresAt: number;
  resendAvailableAt: number;
}

export type EmailStep = "password" | "email" | "code" | "done";

export interface EmailEditorErrors {
  currentPassword?: string;
  newEmail?: string;
  code?: string;
  general?: string;
}
