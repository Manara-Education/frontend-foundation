import { getProfileRequest, updateProfileRequest } from "../api/profile.api";
import type { ProfileResponse, UpdateProfileRequest } from "../types/profile.types";

export async function getProfile(): Promise<ProfileResponse> {
  const { data: body } = await getProfileRequest();
  return body.data!;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<string> {
  const { data: body } = await updateProfileRequest(data);
  return body.data!.message;
}
