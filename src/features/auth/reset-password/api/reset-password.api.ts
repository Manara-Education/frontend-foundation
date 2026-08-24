import { apiClient, type ApiResponse, type MessageResponse } from "@/shared/api";
import type {
  ChangePasswordRequest,
  ResetPasswordRequest,
} from "../types/reset-password.types";

const AUTH_BASE_V1 = "v1/auth";

export function resetPasswordRequest(data: ResetPasswordRequest) {
  return apiClient.post<ApiResponse<MessageResponse>>(
    `${AUTH_BASE_V1}/reset-password`,
    data,
  );
}

/** The signed-in counterpart of `resetPasswordRequest`. Clears the forced-reset flag server-side. */
export function changePasswordRequest(data: ChangePasswordRequest) {
  return apiClient.post<ApiResponse<MessageResponse>>(
    `${AUTH_BASE_V1}/change-password`,
    data,
  );
}
