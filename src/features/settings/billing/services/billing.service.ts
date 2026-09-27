import {
  createRefundRequestRequest,
  getReceiptPdfRequest,
  getReceiptRequest,
  getRefundRequestsRequest,
  getSubscriptionsRequest,
  getTransactionRequest,
  getTransactionsRequest,
} from "../api/billing.api";
import { rangeStart } from "../formatters/billing.formatter";
import { toReceipt, toRefundRequest, toSubscriptionPage, toTransactionDetail, toTransactionPage } from "../mappers/billing.mapper";
import type {
  Receipt,
  RefundReason,
  RefundRequest,
  SubscriptionPage,
  TransactionDetail,
  TransactionFilters,
  TransactionPage,
} from "../types/billing.types";

export const TRANSACTIONS_PAGE_SIZE = 10;

export async function getTransactions(filters: TransactionFilters): Promise<TransactionPage> {
  const { data: body } = await getTransactionsRequest({
    q: filters.q.trim() || undefined,
    status: filters.status || undefined,
    from: rangeStart(filters.range) ?? undefined,
    page: filters.page,
    size: TRANSACTIONS_PAGE_SIZE,
  });
  return toTransactionPage(body.data!);
}

export async function getTransaction(reference: string): Promise<TransactionDetail> {
  const { data: body } = await getTransactionRequest(reference);
  return toTransactionDetail(body.data!);
}

export async function getReceipt(number: string): Promise<Receipt> {
  const { data: body } = await getReceiptRequest(number);
  return toReceipt(body.data!);
}

export async function getSubscriptions(page = 0): Promise<SubscriptionPage> {
  const { data: body } = await getSubscriptionsRequest(page, 20);
  return toSubscriptionPage(body.data!);
}

export async function getRefundRequests(reference: string): Promise<RefundRequest[]> {
  const { data: body } = await getRefundRequestsRequest(reference);
  return (body.data ?? []).map(toRefundRequest);
}

/** Submits a request for review. The server decides the amount; nothing here names one. */
export async function submitRefundRequest(reference: string, reason: RefundReason | null, note: string): Promise<RefundRequest> {
  const trimmed = note.trim();
  const { data: body } = await createRefundRequestRequest(reference, {
    ...(reason ? { reason } : {}),
    ...(trimmed ? { note: trimmed } : {}),
  });
  return toRefundRequest(body.data!);
}

/**
 * Saves a receipt PDF. Shared by Settings and checkout so there is one download path. The object
 * URL is revoked as soon as the browser has taken it.
 */
export async function downloadReceiptPdf(number: string): Promise<void> {
  const { data } = await getReceiptPdfRequest(number);
  const url = URL.createObjectURL(data);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = `manara-receipt-${number}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
