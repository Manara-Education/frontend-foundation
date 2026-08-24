import { loginRequest } from "../api/auth.api";
import type { LoginCredentials, LoginResponse } from "../types/login.types";

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data: body } = await loginRequest(credentials);
  return body.data!;
}
