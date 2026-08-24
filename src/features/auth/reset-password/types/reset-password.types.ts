export interface ResetPasswordFormState {
  /** Only filled in the forced flow, which is the only one that asks for it. */
  currentPassword: string;
  password: string;
  confirm: string;
}

export interface ResetPasswordErrors {
  general?: string;
  currentPassword?: string;
  password?: string;
  confirm?: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

/**
 * The authenticated change-password call, used when the server has flagged the account as
 * owing a password change.
 *
 * Same screen as the anonymous reset, different proof of identity: there an emailed code
 * stands in for the session, here the session is real and the current password is what shows
 * the person at the keyboard is the account's owner.
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
