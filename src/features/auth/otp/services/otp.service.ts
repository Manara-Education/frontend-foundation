import type { MessageResponse } from "@/shared/api";
import { verifyOtpRequest, verifyResetOtpRequest, resendOtpRequest } from "../api/otp.api";
import type { OtpVerifyRequest, ResendOtpRequest, AuthResponse } from "../types/otp.types";

export const verifyOtp = async (data: OtpVerifyRequest): Promise<AuthResponse> => {
  const { data: body } = await verifyOtpRequest(data);
  return body.data!;
};

export const verifyResetOtp = async (data: OtpVerifyRequest): Promise<MessageResponse> => {
  const { data: body } = await verifyResetOtpRequest(data);
  return body.data!;
};

export const resendOtp = async (data: ResendOtpRequest): Promise<MessageResponse> => {
  const { data: body } = await resendOtpRequest(data);
  return body.data!;
};
