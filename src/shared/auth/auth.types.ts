export interface AuthUser {
  fullName: string;
  email: string;
  role: string;

  /**
   * Whether this account must choose a new password before it may use the application.
   *
   * Owned by the server and never written here: the value arrives on sign-in and again on every
   * session restore, and only the backend clears it — after it has actually persisted the new
   * password hash. Flipping it locally would unlock the application without changing anything
   * the server believes, and the API would refuse the next request anyway.
   */
  requiresPasswordReset: boolean;
}

export type AuthStatus = "loading" | "authenticated" | "anonymous";
