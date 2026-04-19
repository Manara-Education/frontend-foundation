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
  token: string;
  fullName: string;
  email: string;
}

export interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}
