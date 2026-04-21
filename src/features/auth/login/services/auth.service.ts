import { loginRequest } from "../api/auth.api";
import type { LoginCredentials, LoginResponse } from "../types/login.types";

const TOKEN_KEY = "auth_token";

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data: body } = await loginRequest(credentials);
  const authData = body.data!;

  localStorage.setItem(TOKEN_KEY, authData.token);

  return authData;
}
