import type { CourseAccessType, CourseStructure, SubscriptionUnit } from "@/shared/courses";

const MODULE_ORDINALS = [
  "الأولى",
  "الثانية",
  "الثالثة",
  "الرابعة",
  "الخامسة",
  "السادسة",
  "السابعة",
  "الثامنة",
  "التاسعة",
  "العاشرة",
];

const UNIT_LABELS: Record<SubscriptionUnit, string> = {
  DAY: "يوم",
  WEEK: "أسبوع",
  MONTH: "شهر",
};

const STRUCTURE_LABELS: Record<CourseStructure, string> = {
  FLAT: "دروس مباشرة",
  MODULES: "وحدات ودروس",
};

/** "الوحدة الأولى", "الوحدة الثانية"… falling back to the plain number past ten. */
export function formatModuleOrdinal(index: number): string {
  return MODULE_ORDINALS[index] ?? String(index + 1);
}

export function formatSubscriptionUnitLabel(unit: SubscriptionUnit): string {
  return UNIT_LABELS[unit];
}

export function formatStructureLabel(structure: CourseStructure): string {
  return STRUCTURE_LABELS[structure];
}

export function formatLessonCountLabel(count: number): string {
  return count === 1 ? "درس" : "دروس";
}

export function formatModuleCountLabel(count: number): string {
  return count === 1 ? "وحدة" : "وحدات";
}

export function formatPrice(price: number): string {
  return price.toLocaleString("ar-EG");
}

/** "30 يوم · 250 ج.م" — the subtitle of a subscription plan row. */
export function formatPlanSummary(duration: number, unit: SubscriptionUnit, price: number): string {
  return `${duration} ${formatSubscriptionUnitLabel(unit)} · ${formatPrice(price)} ج.م`;
}

/** The one-line access summary shown on the wizard's review step. */
export function formatAccessSummary(
  accessType: CourseAccessType,
  purchasePrice: string,
  planCount: number,
): string {
  if (accessType === "FREE") return "مجانية";
  if (accessType === "PURCHASE") return `شراء مرة واحدة — ${purchasePrice} ج.م`;
  return `اشتراك — ${planCount} خطة`;
}

export function extractYouTubeId(url: string): string | null {
  if (!url.trim()) return null;
  const patterns = [
    /(?:youtube\.com\/watch[?&]v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
