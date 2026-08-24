export interface AuthResponse {
  fullName: string;
  email: string;
  role: string;
  /** Server-owned. See `AuthUser` in `@/shared/auth` — verifying an email signs the user in too. */
  requiresPasswordReset: boolean;
}

export type OtpContextType = "email-verification" | "password-reset";

export interface OtpFormState {
  otp: string[];
}

export interface OtpErrors {
  general?: string;
  otp?: string;
}

export interface OtpVerifyRequest {
  email: string;
  code: string;
}

export interface ResendOtpRequest {
  email: string;
  type?: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
}
