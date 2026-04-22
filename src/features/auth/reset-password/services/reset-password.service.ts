import type { MessageResponse } from "@/shared/api";
import { resetPasswordRequest } from "../api/reset-password.api";
import type { ResetPasswordRequest } from "../types/reset-password.types";

export const resetPassword = async (data: ResetPasswordRequest): Promise<MessageResponse> => {
  const { data: body } = await resetPasswordRequest(data);
  return body.data!;
};
