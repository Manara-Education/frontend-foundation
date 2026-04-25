import { apiClient, type ApiResponse, type MessageResponse } from "@/shared/api";
import type { ProfileResponse, UpdateProfileRequest } from "../types/profile.types";

const PROFILE_BASE_V1 = "v1/profile";

export function getProfileRequest() {
  return apiClient.get<ApiResponse<ProfileResponse>>(PROFILE_BASE_V1);
}

export function updateProfileRequest(data: UpdateProfileRequest) {
  return apiClient.put<ApiResponse<MessageResponse>>(PROFILE_BASE_V1, data);
}
