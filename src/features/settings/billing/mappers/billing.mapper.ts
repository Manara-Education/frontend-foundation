import {
  STATUS_LABELS,
  accessLabel,
  formatDate,
  formatDateTime,
  formatMoney,
  planTerm,
  provenanceLabel,
} from "../formatters/billing.formatter";
import type {
  Receipt,
  ReceiptResponse,
  SubscriptionPage,
  SubscriptionPageResponse,
  SubscriptionRow,
  TransactionDetail,
  TransactionDetailResponse,
  TransactionPage,
  TransactionPageResponse,
  TransactionRow,
  TransactionSummaryResponse,
} from "../types/billing.types";

export function toTransactionRow(dto: TransactionSummaryResponse): TransactionRow {
  return {
    reference: dto.reference,
    courseId: dto.course.id,
    courseTitle: dto.course.title,
    description: dto.description,
    amountLabel: formatMoney(dto.amount, dto.currency),
    status: dto.status,
    statusLabel: STATUS_LABELS[dto.status] ?? dto.status,
    provenance: dto.provenance,
    provenanceLabel: provenanceLabel(dto.provenance),
    dateLabel: formatDate(dto.createdAt),
    receiptNumber: dto.receiptNumber,
    accessLabel: accessLabel(dto.courseAccess),
  };
}

export function toTransactionPage(dto: TransactionPageResponse): TransactionPage {
  const counts = dto.provenanceCounts ?? { LIVE: 0, SIMULATED: 0, LEGACY: 0 };
  return {
    rows: dto.items.map(toTransactionRow),
    page: dto.page,
    totalItems: dto.totalItems,
    totalPages: dto.totalPages,
    confirmedTotals: dto.confirmedTotals
      .map((total) => formatMoney(total.amount, total.currency))
      .filter((label): label is string => label !== null),
    excludedCount: (counts.SIMULATED ?? 0) + (counts.LEGACY ?? 0),
  };
}

export function toTransactionDetail(dto: TransactionDetailResponse): TransactionDetail {
  const currency = dto.summary.currency;
  return {
    row: toTransactionRow(dto.summary),
    lines: dto.lines.map((line) => ({ description: line.description, amountLabel: formatMoney(line.amount, currency) })),
    subtotalLabel: formatMoney(dto.subtotal, currency),
    discountLabel: formatMoney(dto.discount, currency),
    totalLabel: formatMoney(dto.total, currency),
    refundedLabel: dto.refundedAmount && dto.refundedAmount > 0 ? formatMoney(dto.refundedAmount, currency) : null,
    gatewayReference: dto.gatewayReference,
    termLabel: dto.subscriptionTerm
      ? `${formatDate(dto.subscriptionTerm.startsAt)} — ${formatDate(dto.subscriptionTerm.expiresAt)}`
      : null,
  };
}

export function toReceipt(dto: ReceiptResponse): Receipt {
  return {
    number: dto.number,
    issuedLabel: formatDateTime(dto.issuedAt),
    simulated: dto.simulated,
    customerName: dto.customerName,
    customerEmail: dto.customerEmail,
    lineDescription: dto.lineDescription,
    amountLabel: formatMoney(dto.amount, dto.currency) ?? "—",
    transactionReference: dto.transactionReference,
    gatewayReference: dto.gatewayReference,
  };
}

function toSubscriptionRow(dto: SubscriptionPageResponse["items"][number]): SubscriptionRow {
  return {
    id: dto.id,
    courseTitle: dto.course.title,
    courseImage: dto.course.imageUrl,
    // Not "·": beside an Arabic-Indic digit it reads as a zero ("· ٣" looks like "٣٠").
    planLabel: `${dto.plan.name}، لمدة ${planTerm(dto.plan.duration, dto.plan.unit)}`,
    priceLabel: formatMoney(dto.pricePaid, dto.currency),
    periodLabel: `${formatDate(dto.startsAt)} — ${formatDate(dto.expiresAt)}`,
    expiresLabel: formatDate(dto.expiresAt),
    running: dto.displayStatus === "FIXED_ACCESS",
    accessLabel: accessLabel(dto.courseAccess),
    transactionReference: dto.transactionReference,
    provenanceLabel: provenanceLabel(dto.provenance),
  };
}

export function toSubscriptionPage(dto: SubscriptionPageResponse): SubscriptionPage {
  const rows = dto.items.map(toSubscriptionRow);
  return {
    current: rows.filter((row) => row.running),
    previous: rows.filter((row) => !row.running),
    activeCount: dto.activeCount,
    totalItems: dto.totalItems,
    page: dto.page,
    totalPages: dto.totalPages,
  };
}
