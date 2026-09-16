import type { MessageResponse } from "@/shared/api";
import { submitContactRequest } from "../api/contact.api";
import type { ContactRequest } from "../types/contact.types";

/**
 * Resolves only once the backend confirms the message was actually sent — a `200` here means
 * the email left, not merely that the request was accepted. A rejected promise (network error,
 * validation `400`, provider `503`) leaves the caller's typed text untouched to retry with.
 */
export const submitContact = async (data: ContactRequest): Promise<MessageResponse> => {
  const { data: body } = await submitContactRequest(data);
  return body.data!;
};
