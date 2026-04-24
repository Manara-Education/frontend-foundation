export interface ResetPasswordFormState {
  password: string;
  confirm: string;
}

export interface ResetPasswordErrors {
  general?: string;
  password?: string;
  confirm?: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}
