import { apiClient, type ApiResponse, type MessageResponse } from "@/shared/api";
import type { OtpVerifyRequest, ResendOtpRequest, AuthResponse } from "../types/otp.types";

const AUTH_BASE_V1 = "v1/auth";

export function verifyOtpRequest(data: OtpVerifyRequest) {
  return apiClient.post<ApiResponse<AuthResponse>>(
    `${AUTH_BASE_V1}/verify-otp`,
    data,
  );
}

export function verifyResetOtpRequest(data: OtpVerifyRequest) {
  return apiClient.post<ApiResponse<MessageResponse>>(
    `${AUTH_BASE_V1}/verify-reset-otp`,
    data,
  );
}

export function resendOtpRequest(data: ResendOtpRequest) {
  return apiClient.post<ApiResponse<MessageResponse>>(
    `${AUTH_BASE_V1}/resend-otp`,
    data,
  );
}
