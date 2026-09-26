import { formatChangedOn, formatMemberSince, getRoleBadge } from "../formatters/profile.formatter";
import type { Profile, ProfileResponse } from "../types/profile.types";

export function toProfile(dto: ProfileResponse): Profile {
  return {
    fullName: dto.fullName,
    email: dto.email,
    roleLabel: getRoleBadge(dto.role),
    memberSince: formatMemberSince(dto.createdAt),
    avatarUrl: dto.avatarUrl ?? null,
    emailVerified: dto.emailVerified === true,
    passwordChangedOn: formatChangedOn(dto.passwordChangedAt),
  };
}
