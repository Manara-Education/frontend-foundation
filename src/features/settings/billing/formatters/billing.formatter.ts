import { formatPlanTerm } from "@/features/public-courses/formatters/public-offer.formatter";
import type { DateRange, Provenance, TransactionStatus } from "../types/billing.types";

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  PAID: "مدفوعة",
  AWAITING_PAYMENT: "بانتظار الدفع",
  PROCESSING: "قيد المعالجة",
  FAILED: "لم تكتمل",
  CANCELLED: "ملغاة",
  REFUNDED: "مستردة",
  PARTIALLY_REFUNDED: "مستردة جزئيًا",
};

/** How much of a record is real money. LIVE needs no label. */
export function provenanceLabel(provenance: Provenance | null): string | null {
  if (provenance === "SIMULATED") return "محاكاة — لا أموال فعلية";
  if (provenance === "LEGACY") return "سجل سابق";
  return null;
}

const CURRENCY_NAMES: Record<string, string> = { EGP: "ج.م" };

/** `450.00 EGP` → "٤٥٠ ج.م"; unknown stays `null`. */
export function formatMoney(amount: number | null, currency: string | null): string | null {
  if (amount == null || !Number.isFinite(amount) || !currency) return null;
  const number = amount.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${number} ${CURRENCY_NAMES[currency] ?? currency}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("ar-EG", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function accessLabel(access: "ACTIVE" | "NONE"): string {
  return access === "ACTIVE" ? "الوصول مفعّل" : "لا يوجد وصول حاليًا";
}

/** The plan's own term, worded the way the public pages word it ("٣ أشهر", never "/شهر"). */
export function planTerm(duration: number, unit: string): string {
  if (unit === "DAY" || unit === "WEEK" || unit === "MONTH") return formatPlanTerm({ duration, unit });
  return `${duration.toLocaleString("ar-EG")} ${unit}`;
}

export const RANGE_LABELS: Record<DateRange, string> = {
  all: "كل الفترات",
  "30d": "آخر ٣٠ يومًا",
  "3m": "آخر ٣ أشهر",
  "1y": "آخر سنة",
};

/** The first day a range includes, as an ISO date on this device's calendar. */
export function rangeStart(range: DateRange, today = new Date()): string | null {
  if (range === "all") return null;
  const start = new Date(today);
  if (range === "30d") start.setDate(start.getDate() - 30);
  if (range === "3m") start.setMonth(start.getMonth() - 3);
  if (range === "1y") start.setFullYear(start.getFullYear() - 1);
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
}
