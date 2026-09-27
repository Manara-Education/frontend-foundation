import { getProfile, updateProfile } from "@/features/profile/services/profile.service";
import type { Profile } from "@/features/profile/types/profile.types";
import { changePasswordRequest } from "../api/account.api";
import { initialsOf } from "@/shared/identity";
import type { AccountOverview, ChangePasswordRequest } from "../types/account.types";

/**
 * The account data Settings shows, read through the profile feature so there is one client for
 * the profile endpoints rather than two.
 */
export function toAccountOverview(profile: Profile): AccountOverview {
  return {
    fullName: profile.fullName,
    initials: initialsOf(profile.fullName),
    email: profile.email,
    roleLabel: profile.roleLabel,
    memberSince: profile.memberSince,
    avatarUrl: profile.avatarUrl,
    emailVerified: profile.emailVerified,
    passwordChangedOn: profile.passwordChangedOn,
  };
}

export async function getAccountOverview(): Promise<AccountOverview> {
  return toAccountOverview(await getProfile());
}

/** Renames the account and returns the profile the server now holds. */
export async function renameAccount(fullName: string): Promise<Profile> {
  return updateProfile({ fullName: fullName.trim() });
}

export async function changePassword(request: ChangePasswordRequest): Promise<void> {
  await changePasswordRequest(request);
}
