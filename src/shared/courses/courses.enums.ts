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

export const COURSE_STRUCTURES: readonly CourseStructure[] = ["FLAT", "MODULES"];
export const COURSE_STATUSES: readonly CourseStatus[] = ["DRAFT", "PUBLISHED"];
export const COURSE_ACCESS_TYPES: readonly CourseAccessType[] = ["FREE", "PURCHASE", "SUBSCRIPTION"];
export const SUBSCRIPTION_UNITS: readonly SubscriptionUnit[] = ["DAY", "WEEK", "MONTH"];

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
