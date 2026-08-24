import { apiClient, type ApiResponse, type MessageResponse } from "@/shared/api";
import type {
  BannerOrderRequest,
  BannerRequest,
  BannerResponse,
} from "../types/banners.types";

const BANNERS_BASE_V1 = "v1/instructor/banners";

/**
 * Banner authoring. Every route is scoped server-side to the signed-in instructor, so none
 * of these calls carries an owner — the id in the path is resolved against the session.
 */
export function getMyBannersRequest() {
  return apiClient.get<ApiResponse<BannerResponse[]>>(`/${BANNERS_BASE_V1}`);
}

export function getBannerRequest(bannerId: number) {
  return apiClient.get<ApiResponse<BannerResponse>>(`/${BANNERS_BASE_V1}/${bannerId}`);
}

export function createBannerRequest(data: BannerRequest) {
  return apiClient.post<ApiResponse<BannerResponse>>(`/${BANNERS_BASE_V1}`, data);
}

export function updateBannerRequest(bannerId: number, data: BannerRequest) {
  return apiClient.put<ApiResponse<BannerResponse>>(`/${BANNERS_BASE_V1}/${bannerId}`, data);
}

/** Answers with the whole list: a drag rewrote every row's position, not just the moved one. */
export function reorderBannersRequest(data: BannerOrderRequest) {
  return apiClient.put<ApiResponse<BannerResponse[]>>(`/${BANNERS_BASE_V1}/order`, data);
}

export function deleteBannerRequest(bannerId: number) {
  return apiClient.delete<ApiResponse<MessageResponse>>(`/${BANNERS_BASE_V1}/${bannerId}`);
}

export function uploadBannerImageRequest(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post<ApiResponse<{ url: string }>>(`/v1/uploads`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
