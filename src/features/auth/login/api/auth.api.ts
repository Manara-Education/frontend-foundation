import { apiClient, type ApiResponse } from "@/shared/api";
import type { LoginCredentials, LoginResponse } from "../types/login.types";

const AUTH_BASE_V1 = "v1/auth";

export function loginRequest(credentials: LoginCredentials) {
  return apiClient.post<ApiResponse<LoginResponse>>(
    `${AUTH_BASE_V1}/login`,
    credentials,
  );
}
