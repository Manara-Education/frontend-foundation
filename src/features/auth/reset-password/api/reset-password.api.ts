import { apiClient, type ApiResponse, type MessageResponse } from "@/shared/api";
import type { ResetPasswordRequest } from "../types/reset-password.types";

const AUTH_BASE_V1 = "v1/auth";

export function resetPasswordRequest(data: ResetPasswordRequest) {
  return apiClient.post<ApiResponse<MessageResponse>>(
    `${AUTH_BASE_V1}/reset-password`,
    data,
  );
}
