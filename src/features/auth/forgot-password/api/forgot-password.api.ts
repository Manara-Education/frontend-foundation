import { apiClient, type ApiResponse, type MessageResponse } from "@/shared/api";
import type { ForgotPasswordRequest } from "../types/forgot-password.types";

const AUTH_BASE_V1 = "v1/auth";

export function forgotPasswordRequest(data: ForgotPasswordRequest) {
  return apiClient.post<ApiResponse<MessageResponse>>(
    `${AUTH_BASE_V1}/forgot-password`,
    data,
  );
}
