export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  fullName: string;
  email: string;
  role: string;
  /** Server-owned. See `AuthUser` in `@/shared/auth` — sign-in is only the first place it arrives. */
  requiresPasswordReset: boolean;
}

export interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}
