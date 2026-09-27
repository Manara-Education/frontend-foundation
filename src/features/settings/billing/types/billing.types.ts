/* ── API types (mirror backend DTOs; see backend docs/api/STUDENT_BILLING_API.md) ── */

export type TransactionStatus =
  | "AWAITING_PAYMENT"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type Provenance = "LIVE" | "SIMULATED" | "LEGACY";

export interface BillingCourseResponse {
  id: number;
  title: string;
  imageUrl: string | null;
  instructorName: string | null;
}

export interface TransactionSummaryResponse {
  reference: string;
  purpose: "PURCHASE" | "SUBSCRIPTION";
  course: BillingCourseResponse;
  description: string;
  amount: number | null;
  currency: string | null;
  status: TransactionStatus;
  provenance: Provenance;
  createdAt: string;
  paidAt: string | null;
  receiptNumber: string | null;
  courseAccess: "ACTIVE" | "NONE";
}

export interface TransactionPageResponse {
  items: TransactionSummaryResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  confirmedTotals: { currency: string; amount: number; count: number }[];
  provenanceCounts: Record<Provenance, number>;
}

export interface TransactionDetailResponse {
  summary: TransactionSummaryResponse;
  lines: { description: string; amount: number | null }[];
  subtotal: number | null;
  discount: number | null;
  total: number | null;
  refundedAmount: number | null;
  gatewayReference: string | null;
  subscriptionTerm: { subscriptionId: number; startsAt: string; expiresAt: string } | null;
}

export interface ReceiptResponse {
  number: string;
  issuedAt: string;
  simulated: boolean;
  fiscal: boolean;
  customerName: string;
  customerEmail: string;
  lineDescription: string;
  amount: number;
  currency: string;
  transactionReference: string;
  gatewayReference: string | null;
}

export interface SubscriptionRecordResponse {
  id: number;
  course: BillingCourseResponse;
  plan: { id: number; name: string; duration: number; unit: string };
  pricePaid: number | null;
  currency: string | null;
  startsAt: string;
  expiresAt: string;
  status: string;
  displayStatus: "FIXED_ACCESS" | "EXPIRED";
  renewalMode: "FIXED";
  courseAccess: "ACTIVE" | "NONE";
  transactionReference: string | null;
  provenance: Provenance | null;
}

export interface SubscriptionPageResponse {
  items: SubscriptionRecordResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  activeCount: number;
}

/* ── Domain/view shapes ───────────────────────────────────── */

/** A formatted amount, or `null` when the server does not know it — never shown as zero. */
export type MoneyLabel = string | null;

export interface TransactionRow {
  reference: string;
  courseId: number;
  courseTitle: string;
  description: string;
  amountLabel: MoneyLabel;
  status: TransactionStatus;
  statusLabel: string;
  provenance: Provenance;
  provenanceLabel: string | null;
  dateLabel: string;
  receiptNumber: string | null;
  accessLabel: string;
}

export interface TransactionPage {
  rows: TransactionRow[];
  page: number;
  totalItems: number;
  totalPages: number;
  /** One label per currency; empty when nothing confirmed matches. */
  confirmedTotals: string[];
  excludedCount: number;
}

export interface TransactionDetail {
  row: TransactionRow;
  lines: { description: string; amountLabel: MoneyLabel }[];
  subtotalLabel: MoneyLabel;
  discountLabel: MoneyLabel;
  totalLabel: MoneyLabel;
  refundedLabel: MoneyLabel;
  gatewayReference: string | null;
  termLabel: string | null;
}

export interface Receipt {
  number: string;
  issuedLabel: string;
  simulated: boolean;
  customerName: string;
  customerEmail: string;
  lineDescription: string;
  amountLabel: string;
  transactionReference: string;
  gatewayReference: string | null;
}

export interface SubscriptionRow {
  id: number;
  courseTitle: string;
  courseImage: string | null;
  planLabel: string;
  priceLabel: MoneyLabel;
  periodLabel: string;
  expiresLabel: string;
  running: boolean;
  accessLabel: string;
  transactionReference: string | null;
  provenanceLabel: string | null;
}

export interface SubscriptionPage {
  current: SubscriptionRow[];
  previous: SubscriptionRow[];
  activeCount: number;
  totalItems: number;
  page: number;
  totalPages: number;
}

export type DateRange = "all" | "30d" | "3m" | "1y";

export interface TransactionFilters {
  q: string;
  status: TransactionStatus | "";
  range: DateRange;
  page: number;
}
