import { apiClient, type ApiResponse, type MessageResponse } from "@/shared/api";
import type { ChangePasswordRequest } from "../types/account.types";

const AUTH_BASE_V1 = "v1/auth";

/** Changes the signed-in account's password. Rotates this session and ends the account's others. */
export function changePasswordRequest(data: ChangePasswordRequest) {
  return apiClient.post<ApiResponse<MessageResponse>>(`${AUTH_BASE_V1}/change-password`, data);
}
