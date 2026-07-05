export interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

export interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  general?: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface PasswordStrength {
  label: string;
  color: string;
  width: string;
}
