import type { SubscriptionUnit } from "@/shared/courses";
import type { Money, PublicOffer, PublicPlan } from "../types/public-courses.types";

/*
  How a public offer reads, in one place, so the landing cards and the course page cannot
  describe the same course differently. Numbers are Egyptian Arabic and amounts carry "ج.م",
  the way every signed-in course screen already prints them.
*/

const NUMBER_LOCALE = "ar-EG";

function formatNumber(value: number, fractionDigits = 0): string {
  return value.toLocaleString(NUMBER_LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function amountDigits(money: Money): string {
  // Whole pounds print bare, as the course screen does; anything else prints both piastre
  // digits, so a price never reads as "99٫5" on one card and "99٫50" on another.
  return formatNumber(money.amount, Number.isInteger(money.amount) ? 0 : 2);
}

/** `"٤٥٠ ج.م"`, `"٩٩٫٥٠ ج.م"`. */
export function formatMoney(money: Money): string {
  return `${amountDigits(money)} ج.م`;
}

/** The same amount for a screen reader, which would otherwise spell "ج.م" out letter by letter. */
export function formatMoneySpoken(money: Money): string {
  return `${amountDigits(money)} جنيه مصري`;
}

const UNIT_LABELS: Record<SubscriptionUnit, string> = {
  DAY: "يوم",
  WEEK: "أسبوع",
  MONTH: "شهر",
};

/**
 * A plan's term in the unit it is sold in — `"١ شهر"` — never converted, since a month is a
 * calendar month to the backend that computes the expiry.
 */
export function formatPlanTerm(plan: Pick<PublicPlan, "duration" | "unit">): string {
  return `${formatNumber(plan.duration)} ${UNIT_LABELS[plan.unit]}`;
}

/** Total video length, or `null` when it is not known — never "٠ دقيقة". */
export function formatDurationSeconds(seconds: number | null): string | null {
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) return null;
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 1) return "أقل من دقيقة";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${formatNumber(minutes)} دقيقة`;
  return minutes === 0 ? `${formatNumber(hours)} ساعة` : `${formatNumber(hours)} ساعة ${formatNumber(minutes)} دقيقة`;
}

/** `"١٢ درس"`, or `null` when the count is unknown or zero. */
export function formatLessonCount(count: number | null): string | null {
  if (count === null || count <= 0) return null;
  return `${formatNumber(count)} درس`;
}

export type OfferTone = "free" | "paid" | "unavailable";

export interface OfferDescription {
  /** The short, visible price: `"مجانية"`, `"٤٥٠ ج.م"`, `"يبدأ من ٤٠ ج.م"`, `"السعر غير متاح"`. */
  badge: string;
  /** What the price buys, when that can be said: `"شراء مرة واحدة"`, `"اشتراك لمدة ١ شهر"`. */
  caption: string | null;
  /** The whole statement as one sentence for assistive technology. */
  spoken: string;
  tone: OfferTone;
}

/**
 * What a visitor is told a course costs.
 *
 * Driven entirely by the validated offer kind. There is no branch that looks at an amount to
 * decide whether something is free, and an unavailable price says so rather than showing a
 * number. A subscription term is described as a period ("لمدة"), not a recurring charge: a plan
 * buys one term, and nothing in the product renews it automatically.
 */
export function describeOffer(offer: PublicOffer): OfferDescription {
  switch (offer.kind) {
    case "FREE":
      return { badge: "مجانية", caption: null, spoken: "دورة مجانية", tone: "free" };
    case "PURCHASE":
      return {
        badge: formatMoney(offer.price),
        caption: "شراء مرة واحدة",
        spoken: `السعر ${formatMoneySpoken(offer.price)}، شراء مرة واحدة`,
        tone: "paid",
      };
    case "SUBSCRIPTION": {
      if (offer.plans.length === 1) {
        const [plan] = offer.plans;
        return {
          badge: formatMoney(plan.price),
          caption: `اشتراك لمدة ${formatPlanTerm(plan)}`,
          spoken: `اشتراك لمدة ${formatPlanTerm(plan)} بسعر ${formatMoneySpoken(plan.price)}`,
          tone: "paid",
        };
      }
      return {
        badge: `يبدأ من ${formatMoney(offer.lowestPrice)}`,
        caption: "اشتراك بعدة خطط",
        spoken: `اشتراك بخطط تبدأ أسعارها من ${formatMoneySpoken(offer.lowestPrice)}`,
        tone: "paid",
      };
    }
    case "UNAVAILABLE":
      return { badge: "السعر غير متاح", caption: null, spoken: "سعر هذه الدورة غير متاح حاليًا", tone: "unavailable" };
  }
}
