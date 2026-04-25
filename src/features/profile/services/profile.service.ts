import { getProfileRequest, updateProfileRequest } from "../api/profile.api";
import { toProfile } from "../mappers/profile.mapper";
import type { Profile, UpdateProfileRequest } from "../types/profile.types";

export async function getProfile(): Promise<Profile> {
  const { data: body } = await getProfileRequest();
  return toProfile(body.data!);
}

export async function updateProfile(data: UpdateProfileRequest): Promise<string> {
  const { data: body } = await updateProfileRequest(data);
  return body.data!.message;
}
