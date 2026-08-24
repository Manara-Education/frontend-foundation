import { apiClient, type ApiResponse } from "@/shared/api";
import type { RegisterCredentials, RegisterResponse } from "../types/register.types";

const AUTH_BASE_V1 = "v1/auth";

export function registerRequest(credentials: RegisterCredentials) {
  return apiClient.post<ApiResponse<RegisterResponse>>(
    `${AUTH_BASE_V1}/register`,
    credentials,
  );
}
