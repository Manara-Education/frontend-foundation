import { apiClient, type ApiResponse } from "@/shared/api";
import type { AuthUser } from "./auth.types";

const AUTH_BASE_V1 = "v1/auth";

export function csrfRequest() {
  return apiClient.get(`${AUTH_BASE_V1}/csrf`);
}

export function meRequest() {
  return apiClient.get<ApiResponse<AuthUser>>(`${AUTH_BASE_V1}/me`);
}

export function logoutRequest() {
  return apiClient.post(`${AUTH_BASE_V1}/logout`);
}
