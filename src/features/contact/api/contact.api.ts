import { apiClient, type ApiResponse, type MessageResponse } from "@/shared/api";
import type { ContactRequest } from "../types/contact.types";

export function submitContactRequest(data: ContactRequest) {
  return apiClient.post<ApiResponse<MessageResponse>>("v1/contact", data);
}
