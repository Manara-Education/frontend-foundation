import { apiClient, type ApiResponse } from "@/shared/api";
import type { CurrentTermsResponse } from "../types/terms.types";

const TERMS_BASE_V1 = "v1/terms";

/**
 * Which version of the terms is in force, and since when.
 *
 * Public and unauthenticated: the page is readable before anyone has an account, and the
 * registration form needs the answer before it can send a consent.
 */
export function getCurrentTermsRequest() {
  return apiClient.get<ApiResponse<CurrentTermsResponse>>(`${TERMS_BASE_V1}/current`);
}
