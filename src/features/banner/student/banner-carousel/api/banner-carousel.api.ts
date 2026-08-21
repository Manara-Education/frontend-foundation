import { apiClient, type ApiResponse, type MessageResponse } from "@/shared/api";
import type { StudentBannerResponse } from "../types/banner-carousel.types";

const STUDENT_BANNERS_BASE_V1 = "v1/student/banners";

/** What this learner should be shown right now, already filtered and ordered server-side. */
export function getActiveBannersRequest() {
  return apiClient.get<ApiResponse<StudentBannerResponse[]>>(`/${STUDENT_BANNERS_BASE_V1}`);
}

/**
 * Records a permanent dismissal. Only meaningful for `ONCE_PER_STUDENT` banners — the
 * shorter modes are the client's own to forget, and the backend refuses them.
 */
export function dismissBannerRequest(bannerId: number) {
  return apiClient.post<ApiResponse<MessageResponse>>(
    `/${STUDENT_BANNERS_BASE_V1}/${bannerId}/dismiss`,
  );
}
