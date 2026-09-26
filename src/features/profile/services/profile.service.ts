import {
  getProfileRequest,
  removeAvatarRequest,
  updateProfileRequest,
  uploadAvatarRequest,
} from "../api/profile.api";
import { toProfile } from "../mappers/profile.mapper";
import type { Profile, ProfileResponse, UpdateProfileRequest } from "../types/profile.types";

export async function getProfile(): Promise<Profile> {
  const { data: body } = await getProfileRequest();
  return toProfile(body.data!);
}

/**
 * Renames the account and returns the profile as it now stands.
 *
 * An older server answers with a message instead of the profile; the updated profile is then
 * read back, so the caller always receives one either way.
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<Profile> {
  const { data: body } = await updateProfileRequest(data);
  const answer = body.data;
  if (answer && "fullName" in answer) return toProfile(answer as ProfileResponse);
  return getProfile();
}

export async function uploadAvatar(
  image: Blob,
  options: { onProgress?: (fraction: number | null) => void; signal?: AbortSignal } = {},
): Promise<Profile> {
  const { data: body } = await uploadAvatarRequest(image, options);
  return toProfile(body.data!);
}

export async function removeAvatar(): Promise<Profile> {
  const { data: body } = await removeAvatarRequest();
  return toProfile(body.data!);
}
