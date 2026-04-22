export interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  confirm: string;
  agreed: boolean;
}

export interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  agreed?: string;
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
