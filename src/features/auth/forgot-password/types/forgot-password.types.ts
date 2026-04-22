export interface ForgotPasswordFormState {
  email: string;
}

export interface ForgotPasswordErrors {
  general?: string;
  email?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}
