import { apiClient, type ApiResponse } from "@/shared/api";
import type { PrivacyPolicyResponse } from "../types/privacy-policy.types";

const PRIVACY_POLICY_BASE_V1 = "v1/privacy-policy";

/** The published privacy policy, with its full text. Public and unauthenticated. */
export function getCurrentPrivacyPolicyRequest() {
  return apiClient.get<ApiResponse<PrivacyPolicyResponse>>(`${PRIVACY_POLICY_BASE_V1}/current`);
}
