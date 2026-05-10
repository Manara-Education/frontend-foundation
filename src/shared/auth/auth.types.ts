export interface AuthUser {
  fullName: string;
  email: string;
  role: string;
}

export type AuthStatus = "loading" | "authenticated" | "anonymous";
