import type { CourseAccessType, SubscriptionUnit } from "@/shared/courses";

/**
 * The anonymous public catalogue: `GET /api/v1/public/courses` and `GET /api/v1/public/courses/{id}`.
 *
 * Two families of types, kept apart on purpose.
 *
 * The `…Response` interfaces describe what the backend *promises* to send (contract:
 * `docs/api/PUBLIC_COURSE_API.md` in backend-foundation). They are documentation, not trust —
 * the payload is validated field by field in `public-courses.mapper.ts` before any of it
 * reaches a screen, because this is a price list shown to people deciding whether to pay.
 *
 * The domain types below them are what the UI renders. Their central rule is that "free" is a
 * kind of offer, never an amount: a missing, zero, negative or malformed price is an
 * `UNAVAILABLE` offer, and there is no code path by which it becomes `FREE` or `0 EGP`.
 */

// ─── wire contract ───────────────────────────────────────────────────────────

export type PublicPricingStatus = "FREE" | "PRICED" | "UNAVAILABLE";

export interface PublicSubscriptionPlanResponse {
  id: number;
  name: string;
  /** Number of `unit`s in one term. */
  duration: number;
  unit: SubscriptionUnit;
  /** EGP, pounds not piastres, two decimal places. */
  price: number;
}

export interface PublicCourseOfferResponse {
  accessType: CourseAccessType;
  pricingStatus: PublicPricingStatus;
  currency: "EGP" | null;
  purchasePrice: number | null;
  plans: PublicSubscriptionPlanResponse[];
}

export interface PublicCourseSummaryResponse {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  instructorName: string | null;
  durationSeconds: number | null;
  lessonCount: number | null;
  offer: PublicCourseOfferResponse;
}

export interface PublicCourseDetailResponse extends PublicCourseSummaryResponse {
  /** Plain text. Rendered as text, never as HTML. */
  description: string | null;
}

export interface PublicCoursePageResponse {
  items: PublicCourseSummaryResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

// ─── domain ──────────────────────────────────────────────────────────────────

/** An amount a visitor may be shown: above zero, at most two decimal places, in EGP. */
export interface Money {
  amount: number;
  currency: "EGP";
}

export interface PublicPlan {
  id: number;
  name: string;
  duration: number;
  unit: SubscriptionUnit;
  price: Money;
}

/**
 * What a course costs, as the page may state it.
 *
 * - `FREE` — the backend said so on both axes (access type and pricing status).
 * - `PURCHASE` — one validated one-off price.
 * - `SUBSCRIPTION` — one or more validated plans, with the lowest price precomputed for a
 *   "from" label. Plans that failed validation are left out.
 * - `UNAVAILABLE` — a paid course whose price cannot be stated. `NOT_STATED` is the backend
 *   saying so; `INVALID` is this client refusing a value that broke the contract. Either way it
 *   is rendered as "price unavailable", never as free and never as 0.
 */
export type PublicOffer =
  | { kind: "FREE" }
  | { kind: "PURCHASE"; price: Money }
  | { kind: "SUBSCRIPTION"; plans: readonly PublicPlan[]; lowestPrice: Money }
  | {
      kind: "UNAVAILABLE";
      /** How the course is sold, when that much could be read; `null` when even that was invalid. */
      accessType: "PURCHASE" | "SUBSCRIPTION" | null;
      reason: "NOT_STATED" | "INVALID";
    };

export interface PublicCourseSummary {
  id: number;
  title: string;
  subtitle: string | null;
  /** A same-origin `/uploads/…` path or an `https` URL; anything else is dropped. */
  imageUrl: string | null;
  instructorName: string | null;
  /** `null` when the backend does not know it yet — never rendered as zero. */
  durationSeconds: number | null;
  lessonCount: number | null;
  offer: PublicOffer;
}

export interface PublicCourseDetail extends PublicCourseSummary {
  description: string | null;
}

export interface PublicCoursePage {
  items: PublicCourseSummary[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  /** Items the backend sent that could not be read at all (no usable id or title), left out. */
  skippedItems: number;
}

// ─── states the hooks expose ─────────────────────────────────────────────────

/**
 * Why a public request produced nothing to show. `malformed` is the backend answering
 * something that is not the contract — shown to the visitor exactly like a server error.
 */
export type PublicCourseFailure = "network" | "rate-limited" | "server" | "malformed";

export type PublicCourseListState =
  | { status: "loading" }
  | { status: "ready"; page: PublicCoursePage }
  | { status: "empty"; page: PublicCoursePage }
  | { status: "error"; failure: PublicCourseFailure };

export type PublicCourseDetailState =
  | { status: "loading" }
  | { status: "ready"; course: PublicCourseDetail }
  | { status: "not-found" }
  | { status: "error"; failure: PublicCourseFailure };
