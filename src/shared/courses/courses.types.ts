/**
 * Canonical course API contracts — the single frontend mirror of the backend's
 * `course` and `lesson` DTOs. Nothing here is a view model: these shapes exist to be
 * fed to a mapper, never rendered directly.
 *
 * Field names and nullability follow the backend exactly. `null` means "the backend
 * can send null here"; `?` means "the field may be absent from the payload".
 */
import type {
  AccessStatus,
  CourseAccessType,
  CourseStatus,
  CourseStructure,
  EntitlementSource,
  SubscriptionUnit,
} from "./courses.enums";
import type {
  InstructorQuizResponse,
  LearnerQuizResponse,
  QuizRequest,
} from "./quiz.types";

// ── Subscription plans ────────────────────────────────────────────────────────

export interface SubscriptionPlanRequest {
  /** Set to update an existing plan of this course; omit to create a new one. */
  id?: number;
  name: string;
  duration: number;
  unit: SubscriptionUnit;
  price: number;
}

export interface SubscriptionPlanResponse {
  id: number;
  name: string;
  duration: number;
  unit: SubscriptionUnit;
  price: number;
  orderIndex: number;
}

// ── Lessons ───────────────────────────────────────────────────────────────────

export interface LessonRequest {
  /** Set to update an existing lesson of the course; omit to create a new one. */
  id?: number;
  title: string;
  summary?: string | null;
  description?: string | null;
  videoUrl: string;
  orderIndex: number;
  /**
   * Required by the standalone lesson endpoints when the course uses modules. Inside a
   * course payload the nesting already says it and the backend ignores this field.
   */
  moduleId?: number | null;
  /** Optional — `null` removes the lesson's quiz. */
  quiz?: QuizRequest | null;
}

/**
 * Learner-facing lesson. The attached quiz is the learner view, so course and lesson
 * browsing can never hand out an answer key.
 *
 * When `locked` is true the viewer has not earned the lesson's content, and the fields
 * that carry it — `videoUrl`, `description` and `quiz` — are absent. What is left is the
 * title, length and position, which is what a locked row in the curriculum shows.
 *
 * @see InstructorLessonResponse for the authoring view
 */
export interface LessonResponse {
  id: number;
  title: string;
  summary: string | null;
  description: string | null;
  videoUrl: string | null;
  duration: string | null;
  orderIndex: number;
  courseId: number;
  moduleId: number | null;
  isCompleted: boolean | null;
  /** True when the viewer may see this lesson listed but not open it. */
  locked: boolean | null;
  quiz: LearnerQuizResponse | null;
  createdAt: string | null;
}

/**
 * Authoring view of a lesson, returned only by the course editor endpoints. The
 * difference that matters is the quiz type.
 */
export interface InstructorLessonResponse {
  id: number;
  title: string;
  summary: string | null;
  description: string | null;
  videoUrl: string | null;
  duration: string | null;
  orderIndex: number;
  courseId: number;
  moduleId: number | null;
  quiz: InstructorQuizResponse | null;
  createdAt: string | null;
}

export interface LessonRef {
  id: number;
  title: string;
}

export interface LessonDetailsResponse {
  lesson: LessonResponse;
  previous: LessonRef | null;
  next: LessonRef | null;
}

// ── Modules ───────────────────────────────────────────────────────────────────

/**
 * A module inside a course payload. Order comes from the array position, not from a
 * submitted value.
 */
export interface CourseModuleRequest {
  /** Set to update an existing module of this course; omit to create a new one. */
  id?: number;
  title: string;
  description?: string | null;
  /** Accepted for round-tripping; the array position is what the backend stores. */
  orderIndex?: number;
  lessons: LessonRequest[];
  /** The module exam. Optional — `null` removes it. */
  quiz?: QuizRequest | null;
}

/** Authoring view of a module — lessons and exam carry the answer key. */
export interface InstructorCourseModuleResponse {
  id: number;
  title: string;
  description: string | null;
  orderIndex: number;
  lessons: InstructorLessonResponse[];
  quiz: InstructorQuizResponse | null;
}

/** Learner view of a module — no answer keys anywhere in the tree. */
export interface LearnerCourseModuleResponse {
  id: number;
  title: string;
  description: string | null;
  orderIndex: number;
  lessons: LessonResponse[];
  quiz: LearnerQuizResponse | null;
  /** True while an earlier module is unfinished, which is what keeps this one shut. */
  locked: boolean | null;
}

// ── Courses ───────────────────────────────────────────────────────────────────

/**
 * The full course aggregate as submitted by the editor.
 *
 * Semantics are full replacement: children carrying an `id` are updated in place,
 * children without one are created, children the payload no longer mentions are
 * removed. An **omitted** `lessons`/`modules` is a metadata-only update that leaves
 * content untouched; an **empty array** is an explicit "remove everything".
 *
 * `structure` decides which of `lessons` and `modules` is read — sending both for the
 * same structure is rejected by the backend.
 */
export interface CourseRequest {
  title: string;
  subtitle?: string | null;
  image?: string | null;
  description: string;
  /** Estimated total duration in minutes. */
  duration?: number | null;
  /** Defaults to `FLAT` when omitted. */
  structure?: CourseStructure;
  /** Read only when `structure` is `FLAT`. */
  lessons?: LessonRequest[];
  /** Read only when `structure` is `MODULES`. */
  modules?: CourseModuleRequest[];
  /** The course final exam. Optional — `null` removes it. */
  finalQuiz?: QuizRequest | null;
  /**
   * Defaults to `PURCHASE` when omitted with a positive price and to `FREE` otherwise,
   * so clients written against the previous price-only contract keep working.
   */
  accessType?: CourseAccessType;
  purchasePrice?: number | null;
  /**
   * Former name of `purchasePrice`, still accepted by the backend. `purchasePrice` wins
   * when both are present.
   *
   * @deprecated New code must send `accessType` + `purchasePrice` / `subscriptionPlans`.
   */
  price?: number | null;
  subscriptionPlans?: SubscriptionPlanRequest[];
  /** Defaults to `DRAFT` on create and to the course's current status on update. */
  status?: CourseStatus;
}

/**
 * Summary shape returned by the course list endpoints (instructor `my-courses`,
 * student browse). The new fields are additive.
 */
export interface CourseResponse {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  description: string | null;
  /** Estimated total duration in minutes. */
  duration: number | null;
  lessonCount: number | null;
  /**
   * Mirror of `purchasePrice` under its former name. **`null` for `FREE` and
   * `SUBSCRIPTION` courses** — read `accessType` to tell those apart.
   *
   * @deprecated Use `accessType` + `purchasePrice`.
   */
  price: number | null;
  purchasePrice: number | null;
  accessType: CourseAccessType | null;
  structure: CourseStructure | null;
  status: CourseStatus | null;
  studentsCount: number | null;
  instructorId: number;
  instructorName: string | null;
  createdAt: string;
  /**
   * Last time the course itself changed. Optional because the older list payloads carry
   * only `createdAt`; readers fall back to it rather than printing nothing.
   */
  updatedAt?: string | null;
  /**
   * Populated only by list endpoints that inline the plans. A `SUBSCRIPTION` course
   * whose payload omits them is still a subscription — the price is what is unknown.
   */
  subscriptionPlans?: SubscriptionPlanResponse[] | null;
  /** Populated only by endpoints that inline the lesson list. */
  lessons: LessonResponse[] | null;
}

/**
 * Everything the course editor needs to reconstruct its state, in one response.
 *
 * Only the branch matching `structure` is populated: a `FLAT` course returns `lessons`
 * with an empty `modules`, a `MODULES` course the reverse. Returned exclusively from
 * instructor endpoints — it carries answer keys throughout.
 */
export interface InstructorCourseResponse {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  description: string | null;
  duration: number | null;
  lessonCount: number | null;
  studentsCount: number | null;
  instructorId: number;
  instructorName: string | null;
  structure: CourseStructure | null;
  status: CourseStatus | null;
  lessons: InstructorLessonResponse[] | null;
  modules: InstructorCourseModuleResponse[] | null;
  finalQuiz: InstructorQuizResponse | null;
  accessType: CourseAccessType | null;
  purchasePrice: number | null;
  /**
   * Mirror of `purchasePrice` under its former name.
   *
   * @deprecated Use `accessType` + `purchasePrice`.
   */
  price: number | null;
  subscriptionPlans: SubscriptionPlanResponse[] | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CourseDetailsInstructorInfo {
  id: number;
  fullName: string;
  email: string | null;
  bio: string | null;
  specialization: string | null;
}

export interface CourseDetailsInfo {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  description: string | null;
  /** Pre-formatted for display by the backend, unlike `CourseResponse.duration`. */
  duration: string | null;
  remainingDuration: string | null;
  lessonCount: number | null;
  /** @deprecated Use `accessType` + `purchasePrice`. */
  price: number | null;
  purchasePrice: number | null;
  accessType: CourseAccessType | null;
  subscriptionPlans: SubscriptionPlanResponse[] | null;
  studentsCount: number | null;
  createdAt: string | null;
}

/**
 * Learner-facing course details. Like the editor response, only the branch matching
 * `structure` is populated. Every quiz in the tree is the learner view.
 *
 * The progression fields describe the viewing learner's own standing, so a client
 * renders locks, the progress bar and "continue where you left off" from what the server
 * decided rather than from rules of its own. They are absent for a viewer the course
 * tracks no progress for — course discovery, typically.
 */
/**
 * The viewing learner's standing on one course: whether they joined it, whether they may
 * open it right now, and — for a subscription — until when.
 *
 * Every field is the server's own answer. "Every lesson is locked" describes a visitor who
 * has not bought the course and a subscriber whose window closed equally well; only this
 * block separates them, which is what decides between a buy CTA and a renew CTA.
 */
export interface CourseAccessResponse {
  /** They joined the course. Stays true after a subscription lapses. */
  enrolled: boolean | null;
  /** They may be served protected content right now. */
  entitled: boolean | null;
  /** What their access rests on, or `null` when nothing was ever granted. */
  source: EntitlementSource | null;
  status: AccessStatus | null;
  startsAt: string | null;
  /** `null` for a grant that never ends — free courses and outright purchases. */
  expiresAt: string | null;
  /** Whole days left before `expiresAt`, or `null` when nothing expires. */
  daysRemaining: number | null;
  /** The plan the current or most recent window was bought under, when there is one. */
  planId: number | null;
}

export interface CourseDetailsResponse {
  course: CourseDetailsInfo;
  instructor: CourseDetailsInstructorInfo;
  /** The viewing learner's own standing. Absent for a response that predates the field. */
  access: CourseAccessResponse | null;
  structure: CourseStructure | null;
  lessons: LessonResponse[] | null;
  modules: LearnerCourseModuleResponse[] | null;
  finalQuiz: LearnerQuizResponse | null;
  /** Percentage of the course's lessons this learner has completed, 0–100. */
  progress: number | null;
  /** True once the curriculum is finished and the final exam, if there is one, is passed. */
  courseCompleted: boolean | null;
  /** The lesson to open next, or `null` when nothing is left to open. */
  nextLessonId: number | null;
}

// ── Lesson completion ─────────────────────────────────────────────────────────

/**
 * What completing a lesson changed.
 *
 * Marking a lesson done moves the course progress, may open the next module and may
 * finish the course. All of that is decided by the server and reported back here rather
 * than left for a client to re-derive.
 */
export interface LessonCompletionResponse {
  lessonId: number;
  completed: boolean | null;
  /** Percentage of the course's lessons now complete, 0–100. */
  courseProgress: number | null;
  /** The lesson to open next, or `null` when nothing is left to open. */
  nextLessonId: number | null;
  /** True once the curriculum is finished and the final exam, if there is one, is passed. */
  courseCompleted: boolean | null;
}

// ── Enrollment / checkout ─────────────────────────────────────────────────────

/**
 * The payment instrument, as the checkout form produces it.
 *
 * Card-shaped and nothing more, because there is no payment provider behind the backend.
 * When a real one arrives this becomes an opaque token.
 */
export interface PaymentMethodRequest {
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
  email?: string;
}

/**
 * What a learner submits to gain access to a course. The backend decides which parts it
 * reads from the course's own access type — leaving fields out cannot buy a cheaper path.
 *
 * - `FREE` — `{}`
 * - `PURCHASE` — `{ paymentMethod }`; the amount is the course's stored price
 * - `SUBSCRIPTION` — `{ planId, paymentMethod }`; only the identifier is trusted, and the
 *   plan's price, duration and expiry are read from the plan row server-side
 *
 * There is deliberately no field for a price or an expiry. Both are computed by the server.
 */
export interface CheckoutRequest {
  /** Required for a `SUBSCRIPTION` course, ignored for the other two. */
  planId?: number;
  paymentMethod?: PaymentMethodRequest;
}

/**
 * What a checkout produced.
 *
 * Returned identically whether the call did the work or found it already done, so a retried
 * or double-clicked checkout is indistinguishable from the one that succeeded — except that
 * `paymentReference` is `null`, because nothing was charged the second time.
 */
export interface CheckoutResponse {
  enrollmentId: number | null;
  courseId: number;
  accessType: CourseAccessType | null;
  access: CourseAccessResponse | null;
  /**
   * The gateway's reference for the charge this call made, or `null` when nothing was
   * charged. Payments are simulated by the backend; its references are prefixed `sim_`.
   */
  paymentReference: string | null;
}

/** Query parameter of the student course details endpoint. */
export type CourseViewMode = "ENROLLED" | "DISCOVER";
