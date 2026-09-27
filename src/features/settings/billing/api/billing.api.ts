import { apiClient, type ApiResponse } from "@/shared/api";
import type {
  BillingCapabilitiesResponse,
  ReceiptResponse,
  SubscriptionPageResponse,
  TransactionDetailResponse,
  TransactionPageResponse,
} from "../types/billing.types";

const BASE = "v1/student";

export interface TransactionQuery {
  q?: string;
  status?: string;
  from?: string;
  page: number;
  size: number;
}

export function getTransactionsRequest(query: TransactionQuery) {
  return apiClient.get<ApiResponse<TransactionPageResponse>>(`${BASE}/transactions`, { params: query });
}

export function getTransactionRequest(reference: string) {
  return apiClient.get<ApiResponse<TransactionDetailResponse>>(`${BASE}/transactions/${encodeURIComponent(reference)}`);
}

export function getReceiptRequest(number: string) {
  return apiClient.get<ApiResponse<ReceiptResponse>>(`${BASE}/receipts/${encodeURIComponent(number)}`);
}

/** The receipt PDF as bytes, fetched with the session so ownership is checked like any other read. */
export function getReceiptPdfRequest(number: string) {
  return apiClient.get<Blob>(`${BASE}/receipts/${encodeURIComponent(number)}/pdf`, { responseType: "blob", timeout: 30_000 });
}

export function getSubscriptionsRequest(page: number, size: number) {
  return apiClient.get<ApiResponse<SubscriptionPageResponse>>(`${BASE}/subscriptions`, { params: { page, size } });
}

export function getBillingCapabilitiesRequest() {
  return apiClient.get<ApiResponse<BillingCapabilitiesResponse>>(`${BASE}/billing/capabilities`);
}
