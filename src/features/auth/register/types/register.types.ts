export interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  confirm: string;
  /**
   * Whether the visitor has ticked the terms box. Starts `false` and is *reset* to `false`
   * whenever the version it was given against stops being current — consent is to a specific
   * text, so it cannot be carried across a revision.
   */
  termsAccepted: boolean;
}

export interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  /** The consent box was not ticked. */
  terms?: string;
  general?: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  /** Always `true` — the request is not sent at all without an explicit acceptance. */
  termsAccepted: boolean;
  /** The exact version the user was shown, as named by the server. Never guessed. */
  termsVersion: string;
}

export interface RegisterResponse {
  message: string;
}
