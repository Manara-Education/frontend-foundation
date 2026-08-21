import type {
  BannerDisplayFrequency,
  BannerStatus,
} from "@/features/banner/types/banner.types";

export const PRIMARY = "#4E5B92";
export const FONT = "'Cairo', sans-serif";

/** Zones the editor offers. The list and its wording are the reference's. */
export const TIMEZONES: readonly { value: string; label: string }[] = [
  { value: "Asia/Riyadh", label: "توقيت الرياض (AST)" },
  { value: "Africa/Cairo", label: "توقيت القاهرة (EET)" },
  { value: "Asia/Dubai", label: "توقيت دبي (GST)" },
  { value: "Asia/Kuwait", label: "توقيت الكويت (AST)" },
  { value: "UTC", label: "UTC" },
];

export const DURATION_SHORTCUTS: readonly { label: string; days: number }[] = [
  { label: "يوم", days: 1 },
  { label: "٣ أيام", days: 3 },
  { label: "أسبوع", days: 7 },
  { label: "أسبوعان", days: 14 },
  { label: "شهر", days: 30 },
];

export const FREQUENCY_OPTIONS: readonly { value: BannerDisplayFrequency; label: string }[] = [
  { value: "EVERY_VISIT", label: "كل زيارة" },
  { value: "ONCE_PER_SESSION", label: "مرة لكل جلسة" },
  { value: "ONCE_PER_STUDENT", label: "مرة واحدة للطالب" },
];

const STATUS_LABELS: Record<BannerStatus, string> = {
  ACTIVE: "نشط",
  SCHEDULED: "مجدوَل",
  DRAFT: "مسودة",
  EXPIRED: "منتهي",
  INACTIVE: "غير نشط",
};

export function getStatusLabel(status: BannerStatus): string {
  return STATUS_LABELS[status] ?? status;
}

/** The saved-state confirmation each of the editor's three buttons shows. */
export function getSavedMessage(action: "draft" | "schedule" | "publish"): string {
  if (action === "draft") return "تم الحفظ كمسودة";
  return action === "publish" ? "تم النشر بنجاح" : "تمت الجدولة بنجاح";
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** `yyyy-mm-dd` for a `<input type="date">`, read in local time rather than UTC. */
export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** `hh:mm` for a `<input type="time">`. */
export function formatTimeInput(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

/**
 * A date and a time from two inputs, back into the instant the pair names.
 *
 * The browser reads `yyyy-mm-ddThh:mm` as local time, which is what the owner typed. What
 * goes on the wire is the local wall-clock string, because the backend stores
 * `LocalDateTime` and would read a `Z`-suffixed instant as that literal time.
 */
export function toLocalDateTime(date: string, time: string): string | undefined {
  if (!date) return undefined;
  return `${date}T${(time || "00:00").slice(0, 5)}:00`;
}

/** The current instant in the same wire form, for "publish now". */
export function nowAsLocalDateTime(): string {
  const now = new Date();
  return `${formatDateInput(now)}T${formatTimeInput(now)}:00`;
}

/** Long Arabic date with the time, as the list prints under each row. */
export function formatDateAr(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** The suffix a duplicated banner's internal name is given. */
export function toDuplicateName(internalName: string): string {
  return `${internalName} (نسخة)`;
}
