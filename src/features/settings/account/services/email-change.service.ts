import { toProfile } from "@/features/profile/mappers/profile.mapper";
import type { Profile } from "@/features/profile/types/profile.types";
import {
  resendEmailChangeRequest,
  startEmailChangeRequest,
  verifyEmailChangeRequest,
} from "../api/email-change.api";
import type { EmailChallenge, EmailChangeChallengeResponse } from "../types/account.types";

/**
 * Places the server's deadlines on this device's clock.
 *
 * The relative seconds are what the server measured when it answered, so they are right whatever
 * this device's time zone or clock skew. The absolute timestamps carry no zone and are used only if
 * an older server sends no relative values.
 */
export function toChallenge(dto: EmailChangeChallengeResponse, receivedAt = Date.now()): EmailChallenge {
  const at = (seconds: number | undefined, stamp: string) =>
    seconds != null ? receivedAt + seconds * 1000 : new Date(stamp).getTime();
  return {
    requestId: dto.requestId,
    maskedEmail: dto.maskedEmail,
    codeLength: dto.codeLength || 6,
    expiresAt: at(dto.expiresInSeconds, dto.expiresAt),
    resendAvailableAt: at(dto.resendAvailableInSeconds, dto.resendAvailableAt),
  };
}

export async function startEmailChange(currentPassword: string, newEmail: string): Promise<EmailChallenge> {
  const { data: body } = await startEmailChangeRequest({ currentPassword, newEmail: newEmail.trim() });
  return toChallenge(body.data!);
}

export async function resendEmailChange(requestId: string): Promise<EmailChallenge> {
  const { data: body } = await resendEmailChangeRequest(requestId);
  return toChallenge(body.data!);
}

export async function verifyEmailChange(requestId: string, code: string): Promise<Profile> {
  const { data: body } = await verifyEmailChangeRequest(requestId, code);
  return toProfile(body.data!);
}
