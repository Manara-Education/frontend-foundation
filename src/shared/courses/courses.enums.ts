/**
 * Course domain enums, mirroring the backend enums of the same names.
 *
 * The wire form is uppercase in both directions. The backend accepts any casing on
 * write but always answers uppercase, so these unions are what responses carry.
 */

/** Shape of a course's content tree. `FLAT` owns lessons directly, `MODULES` owns modules. */
export type CourseStructure = "FLAT" | "MODULES";

/** Publication state. Only `PUBLISHED` courses are visible to learners. */
export type CourseStatus = "DRAFT" | "PUBLISHED";

/** How a learner gains access to a course. */
export type CourseAccessType = "FREE" | "PURCHASE" | "SUBSCRIPTION";

/** Billing period unit of a course subscription plan. */
export type SubscriptionUnit = "DAY" | "WEEK" | "MONTH";

/**
 * What a learner's access to a course rests on.
 *
 * Mirrors `CourseAccessType` but answers a different question: the access type is how the
 * course is sold, the source is what this learner actually holds. They can disagree — a
 * course switched to `SUBSCRIPTION` after someone bought it outright still owes them that
 * purchase.
 */
export type EntitlementSource = "FREE" | "PURCHASE" | "SUBSCRIPTION";

/**
 * What the course screen should say about a learner's standing.
 *
 * `EXPIRING_SOON` is the backend's decision, not a date comparison done here — the warning
 * threshold is a product rule and two screens must not disagree about the same subscription.
 */
export type AccessStatus = "NONE" | "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";

export const COURSE_STRUCTURES: readonly CourseStructure[] = ["FLAT", "MODULES"];
export const COURSE_STATUSES: readonly CourseStatus[] = ["DRAFT", "PUBLISHED"];
export const COURSE_ACCESS_TYPES: readonly CourseAccessType[] = ["FREE", "PURCHASE", "SUBSCRIPTION"];
export const SUBSCRIPTION_UNITS: readonly SubscriptionUnit[] = ["DAY", "WEEK", "MONTH"];
export const ENTITLEMENT_SOURCES: readonly EntitlementSource[] = ["FREE", "PURCHASE", "SUBSCRIPTION"];
export const ACCESS_STATUSES: readonly AccessStatus[] = ["NONE", "ACTIVE", "EXPIRING_SOON", "EXPIRED"];

/**
 * Falls back to the backend's own default when a response omits the value, which
 * happens for courses created before the field existed.
 */
export function normalizeCourseStructure(value: CourseStructure | null | undefined): CourseStructure {
  return value != null && COURSE_STRUCTURES.includes(value) ? value : "FLAT";
}

export function normalizeCourseStatus(value: CourseStatus | null | undefined): CourseStatus {
  return value != null && COURSE_STATUSES.includes(value) ? value : "DRAFT";
}

export function normalizeCourseAccessType(
  value: CourseAccessType | null | undefined,
): CourseAccessType {
  return value != null && COURSE_ACCESS_TYPES.includes(value) ? value : "FREE";
}

/**
 * A response that predates the access block, or a viewer the course tracks nothing for,
 * both arrive as nothing. Neither is an error — they simply have no standing.
 */
export function normalizeAccessStatus(value: AccessStatus | null | undefined): AccessStatus {
  return value != null && ACCESS_STATUSES.includes(value) ? value : "NONE";
}
