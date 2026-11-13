import { SUBSCRIPTION_UNITS, type SubscriptionUnit } from "@/shared/courses";
import { PublicCourseError } from "../services/public-course.error";
import type {
  Money,
  PublicCourseDetail,
  PublicCoursePage,
  PublicCourseSummary,
  PublicOffer,
  PublicPlan,
} from "../types/public-courses.types";

/*
  The runtime boundary between the public catalogue API and the screens.

  Everything arrives as `unknown` and is read field by field. The rule that shapes every
  decision here: a value that does not match the contract must not become a *misleading*
  offer. So an unreadable price is never repaired, rounded, defaulted to zero or taken to mean
  free — it becomes an `UNAVAILABLE` offer, which the UI states honestly. The shared
  `normalizeCourseAccessType` is deliberately not used: it falls back to FREE, which is the one
  fallback a price list must never make.

  Granularity: one unreadable card is left out of its page rather than failing the page; an
  unreadable page, or an unreadable detail, is a `malformed` failure.
*/

type Json = Record<string, unknown>;

const isRecord = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0;

const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/** What the backend's upload service produces, or an `https` URL with a host and no credentials. */
function safeImageUrl(value: unknown): string | null {
  const url = text(value);
  if (!url) return null;
  if (/^\/uploads\/[A-Za-z0-9][A-Za-z0-9._-]*$/.test(url) && !url.includes("..")) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname !== "" && !parsed.username && !parsed.password
      ? parsed.href
      : null;
  } catch {
    return null;
  }
}

/**
 * An amount a visitor may be shown, or `null`.
 *
 * Above zero, finite, EGP, and exactly representable in piastres — the contract promises two
 * decimal places, so `99.999` is a broken value, not something to round into a price.
 */
export function toMoney(amount: unknown, currency: unknown): Money | null {
  if (currency !== "EGP") return null;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return null;
  const piastres = amount * 100;
  if (Math.abs(piastres - Math.round(piastres)) > 1e-6) return null;
  return { amount: Math.round(piastres) / 100, currency: "EGP" };
}

function toPlan(raw: unknown, currency: unknown): PublicPlan | null {
  if (!isRecord(raw)) return null;
  const name = text(raw.name);
  const price = toMoney(raw.price, currency);
  if (!isPositiveInteger(raw.id) || !name || !isPositiveInteger(raw.duration) || !price) return null;
  if (!SUBSCRIPTION_UNITS.includes(raw.unit as SubscriptionUnit)) return null;
  return { id: raw.id, name, duration: raw.duration, unit: raw.unit as SubscriptionUnit, price };
}

function paidAccessType(value: unknown): "PURCHASE" | "SUBSCRIPTION" | null {
  return value === "PURCHASE" || value === "SUBSCRIPTION" ? value : null;
}

/**
 * The offer as the page may state it. See `PublicOffer` for the four outcomes.
 *
 * FREE needs both axes to agree. A course whose access type says FREE while its pricing status
 * says otherwise, or the reverse, is contradicting itself, and a contradiction about whether
 * something costs money is resolved as "cannot say", not as "free".
 */
export function toPublicOffer(raw: unknown): PublicOffer {
  const invalid = (accessType: unknown): PublicOffer => ({
    kind: "UNAVAILABLE",
    accessType: paidAccessType(accessType),
    reason: "INVALID",
  });
  if (!isRecord(raw)) return invalid(null);

  const { accessType, pricingStatus, currency } = raw;

  if (accessType === "FREE" || pricingStatus === "FREE") {
    return accessType === "FREE" && pricingStatus === "FREE" ? { kind: "FREE" } : invalid(accessType);
  }
  if (accessType !== "PURCHASE" && accessType !== "SUBSCRIPTION") return invalid(null);
  if (pricingStatus === "UNAVAILABLE") return { kind: "UNAVAILABLE", accessType, reason: "NOT_STATED" };
  if (pricingStatus !== "PRICED") return invalid(accessType);

  if (accessType === "PURCHASE") {
    const price = toMoney(raw.purchasePrice, currency);
    return price ? { kind: "PURCHASE", price } : invalid(accessType);
  }

  const plans = (Array.isArray(raw.plans) ? raw.plans : [])
    .map((plan) => toPlan(plan, currency))
    .filter((plan): plan is PublicPlan => plan !== null);
  if (plans.length === 0) return invalid(accessType);

  const lowestPrice = plans.reduce((lowest, plan) => (plan.price.amount < lowest.amount ? plan.price : lowest), plans[0].price);
  return { kind: "SUBSCRIPTION", plans, lowestPrice };
}

/** A card, or `null` when it has no usable id or title to show. */
export function toPublicCourseSummary(raw: unknown): PublicCourseSummary | null {
  if (!isRecord(raw)) return null;
  const title = text(raw.title);
  if (!isPositiveInteger(raw.id) || !title) return null;
  return {
    id: raw.id,
    title,
    subtitle: text(raw.subtitle),
    imageUrl: safeImageUrl(raw.imageUrl),
    instructorName: text(raw.instructorName),
    durationSeconds: isPositiveInteger(raw.durationSeconds) ? raw.durationSeconds : null,
    lessonCount: isCount(raw.lessonCount) ? raw.lessonCount : null,
    offer: toPublicOffer(raw.offer),
  };
}

export function toPublicCourseDetail(raw: unknown): PublicCourseDetail {
  const summary = toPublicCourseSummary(raw);
  if (!summary || !isRecord(raw)) throw new PublicCourseError("malformed");
  return { ...summary, description: text(raw.description) };
}

export function toPublicCoursePage(raw: unknown): PublicCoursePage {
  if (
    !isRecord(raw) ||
    !Array.isArray(raw.items) ||
    !isCount(raw.page) ||
    !isPositiveInteger(raw.size) ||
    !isCount(raw.totalItems) ||
    !isCount(raw.totalPages)
  ) {
    throw new PublicCourseError("malformed");
  }

  const items = raw.items.map(toPublicCourseSummary);
  const readable = items.filter((item): item is PublicCourseSummary => item !== null);
  return {
    items: readable,
    page: raw.page,
    size: raw.size,
    totalItems: raw.totalItems,
    totalPages: raw.totalPages,
    skippedItems: items.length - readable.length,
  };
}
