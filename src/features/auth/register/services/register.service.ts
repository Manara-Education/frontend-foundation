import { registerRequest } from "../api/register.api";
import type { RegisterCredentials, RegisterResponse } from "../types/register.types";

export async function registerUser(credentials: RegisterCredentials): Promise<RegisterResponse> {
  const { data: body } = await registerRequest(credentials);
  return body.data!;
}
