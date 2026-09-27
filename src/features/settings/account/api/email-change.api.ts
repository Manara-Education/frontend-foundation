import { apiClient, type ApiResponse } from "@/shared/api";
import type { ProfileResponse } from "@/features/profile/types/profile.types";
import type { EmailChangeChallengeResponse, EmailChangeStartRequest } from "../types/account.types";

const BASE = "v1/profile/email/change-requests";

export function startEmailChangeRequest(data: EmailChangeStartRequest) {
  return apiClient.post<ApiResponse<EmailChangeChallengeResponse>>(BASE, data);
}

export function resendEmailChangeRequest(requestId: string) {
  return apiClient.post<ApiResponse<EmailChangeChallengeResponse>>(`${BASE}/resend`, { requestId });
}

/** Succeeding rotates this session and ends the account's others. */
export function verifyEmailChangeRequest(requestId: string, code: string) {
  return apiClient.post<ApiResponse<ProfileResponse>>(`${BASE}/verify`, { requestId, code });
}
