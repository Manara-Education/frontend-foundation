import type { MessageResponse } from "@/shared/api";
import { changePasswordRequest, resetPasswordRequest } from "../api/reset-password.api";
import type {
  ChangePasswordRequest,
  ResetPasswordRequest,
} from "../types/reset-password.types";

export const resetPassword = async (data: ResetPasswordRequest): Promise<MessageResponse> => {
  const { data: body } = await resetPasswordRequest(data);
  return body.data!;
};

export const changePassword = async (
  data: ChangePasswordRequest,
): Promise<MessageResponse> => {
  const { data: body } = await changePasswordRequest(data);
  return body.data!;
};
