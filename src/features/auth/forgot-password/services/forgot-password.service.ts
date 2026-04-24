import type { MessageResponse } from "@/shared/api";
import { forgotPasswordRequest } from "../api/forgot-password.api";
import type { ForgotPasswordRequest } from "../types/forgot-password.types";

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
  const { data: body } = await forgotPasswordRequest(data);
  return body.data!;
};
