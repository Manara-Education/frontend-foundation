import type { CourseAccessType, CourseStructure, SubscriptionUnit } from "@/shared/courses";
import type { VideoProvider, VideoResolutionError } from "@/shared/video";

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

/**
 * The Arabic message for a video URL the product cannot play.
 *
 * Video parsing itself is not here. It lives in `@/shared/video`, which the student player, the
 * instructor preview and the lesson card all share — this formatter only turns the resolver's
 * verdict into words. The prototype had the parsing in this file *and* a second copy inside the
 * player component, which is how the two could disagree about the same URL.
 */
export function formatVideoUrlError(error: VideoResolutionError): string {
  switch (error) {
    case "EMPTY":
      return "يرجى إدخال رابط الفيديو";
    case "UNSUPPORTED_PROVIDER":
      return "منصة الفيديو غير مدعومة. استخدم يوتيوب أو فيميو";
    case "NO_VIDEO_ID":
      return "هذا الرابط لا يشير إلى فيديو";
    case "MALFORMED":
    default:
      return "رابط الفيديو غير صحيح";
  }
}

/** The platform's name as an instructor should see it. */
export function formatVideoProviderLabel(provider: VideoProvider): string {
  return VIDEO_PROVIDER_LABELS[provider];
}

const VIDEO_PROVIDER_LABELS: Record<VideoProvider, string> = {
  YOUTUBE: "YouTube",
  VIMEO: "Vimeo",
};
