import { getProfile, updateProfile } from "@/features/profile/services/profile.service";
import { changePasswordRequest } from "../api/account.api";
import { initialsOf } from "../formatters/account.formatter";
import type { AccountOverview, ChangePasswordRequest } from "../types/account.types";

/**
 * The account data Settings shows, read through the profile feature so there is one client for
 * the profile endpoints rather than two.
 */
export async function getAccountOverview(): Promise<AccountOverview> {
  const profile = await getProfile();
  return {
    fullName: profile.fullName,
    initials: initialsOf(profile.fullName),
    email: profile.email,
    roleLabel: profile.roleLabel,
    memberSince: profile.memberSince,
  };
}

export async function renameAccount(fullName: string): Promise<void> {
  await updateProfile({ fullName: fullName.trim() });
}

export async function changePassword(request: ChangePasswordRequest): Promise<void> {
  await changePasswordRequest(request);
}
