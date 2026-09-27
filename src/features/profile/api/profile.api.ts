import { apiClient, type ApiResponse, type MessageResponse } from "@/shared/api";
import type { ProfileResponse, UpdateProfileRequest } from "../types/profile.types";

const PROFILE_BASE_V1 = "v1/profile";

export function getProfileRequest() {
  return apiClient.get<ApiResponse<ProfileResponse>>(PROFILE_BASE_V1);
}

/**
 * Answers with the updated profile. A server older than the avatar release answered with a
 * message only, which is why the body type admits both.
 */
export function updateProfileRequest(data: UpdateProfileRequest) {
  return apiClient.put<ApiResponse<ProfileResponse | MessageResponse>>(PROFILE_BASE_V1, data);
}

/** Replaces the caller's photo. Progress is reported by the browser's upload events. */
export function uploadAvatarRequest(
  image: Blob,
  options: { onProgress?: (fraction: number | null) => void; signal?: AbortSignal } = {},
) {
  const form = new FormData();
  form.append("file", image, image.type === "image/png" ? "avatar.png" : "avatar.jpg");
  return apiClient.post<ApiResponse<ProfileResponse>>(`${PROFILE_BASE_V1}/avatar`, form, {
    // The client defaults to JSON; the endpoint accepts multipart only (axios adds the boundary).
    headers: { "Content-Type": "multipart/form-data" },
    signal: options.signal,
    onUploadProgress: (event) =>
      options.onProgress?.(event.total ? Math.min(1, event.loaded / event.total) : null),
  });
}

export function removeAvatarRequest() {
  return apiClient.delete<ApiResponse<ProfileResponse>>(`${PROFILE_BASE_V1}/avatar`);
}

export interface InstructorProfileResponse {
  headline: string | null;
}

/** The instructor's public headline (instructors only; other roles are answered 404). */
export function getInstructorProfileRequest() {
  return apiClient.get<ApiResponse<InstructorProfileResponse>>(`${PROFILE_BASE_V1}/instructor`);
}

export function updateInstructorProfileRequest(headline: string) {
  return apiClient.put<ApiResponse<InstructorProfileResponse>>(`${PROFILE_BASE_V1}/instructor`, { headline });
}
