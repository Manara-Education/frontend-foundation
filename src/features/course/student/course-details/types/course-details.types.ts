/**
 * Student course details: canonical DTOs in, one view model out.
 *
 * The DTOs are re-exported from `@/shared/courses` under the names this feature already
 * used, so the API and mapper layers speak the real contract without the components
 * having to change.
 */
export type {
  CourseDetailsInfo as CourseInfoApi,
  CourseDetailsInstructorInfo as InstructorInfoApi,
  CourseDetailsResponse as CourseDetailsApiResponse,
  CourseViewMode,
  LearnerCourseModuleResponse as CourseModuleApi,
  LessonResponse as LessonApi,
} from "@/shared/courses";

import type {
  AccessStatus,
  CourseAccessType,
  CourseStructure,
  EntitlementSource,
} from "@/shared/courses";
import type { QuizView } from "@/features/quiz/student/quiz-player";

// ── Domain / view shapes ──────────────────────────────────────────────────────

/**
 * The four states a curriculum row can be in.
 *
 * Every one of them comes from the server's own answer — `locked`, `isCompleted` and
 * `nextLessonId` — never from a lesson's position in the list.
 */
export type LessonStatus = "completed" | "current" | "not-started" | "locked";

export type CourseDetailsMode = "enrolled" | "browse";

/**
 * One purchasable subscription plan, ready to render.
 *
 * The figures are the backend's: `priceLabel` comes from the stored plan price and
 * `durationLabel` from its `duration` + `unit`. Nothing here is a local constant, and only
 * `id` is ever sent back — the price a learner is charged is decided server-side from this
 * same row.
 */
export interface SubscriptionPlanOption {
  id: number;
  name: string;
  /** e.g. `"٣٠ يوم"`, `"٣ شهر"` — the plan's real duration, in the unit it is sold in. */
  durationLabel: string;
  /** e.g. `"٦٠٠ ج.م"`. */
  priceLabel: string;
}

/**
 * The viewing learner's standing on this course.
 *
 * This is what picks the call to action. "Every lesson is locked" is true both for someone
 * who never bought the course and for a subscriber whose window closed, and only `status`
 * and `entitled` tell those two apart.
 */
export interface CourseAccess {
  /** They joined the course. Stays true after a subscription lapses. */
  enrolled: boolean;
  /** They may open the content right now. */
  entitled: boolean;
  source: EntitlementSource | null;
  status: AccessStatus;
  /** e.g. `"٧ سبتمبر ٢٠٢٦"`. Empty when the access never ends. */
  endDateLabel: string;
  /** Whole days left, or `null` when nothing expires. Straight from the server. */
  daysRemaining: number | null;
  /** The plan the current or most recent window was bought under. */
  planId: number | null;
}

export interface Lesson {
  id: number;
  number: number;
  title: string;
  duration: string;
  status: LessonStatus;
  /** The lesson's own quiz, when the learner may see it. */
  quiz: QuizView | null;
}

/**
 * A module of a `MODULES` course, with the exam that closes it.
 *
 * `locked` is the backend's answer to "is an earlier module still unfinished", so the
 * card never decides for itself which modules have opened.
 */
export interface CurriculumModule {
  id: number;
  number: number;
  title: string;
  description: string;
  locked: boolean;
  lessons: Lesson[];
  /** The module exam, when the module has one. */
  quiz: QuizView | null;
}

/**
 * What the course details screen renders.
 *
 * The pricing fields sit side by side on purpose: `price` is what the current payment
 * UI reads, `accessType`/`purchasePrice`/`subscriptionPlans` are what the migrated
 * checkout must read, since `price` is `null` for both free *and* subscription courses.
 */
export interface StudentCourseModel {
  id: number;
  title: string;
  instructor: string;
  instructorTitle: string;
  instructorBio: string;
  instructorStudents: number;
  instructorCourses: number;
  instructorImage: string;
  description: string;
  outcomes: string[];
  skills: string[];
  image: string;
  /** The server's figure, 0–100. Not recomputed here. */
  progress: number;
  totalLessons: number;
  completedLessons: number;
  totalDuration: string;
  remainingDuration: string;
  students: number;
  rating: number;
  category: string;
  /**
   * @deprecated Kept so the existing payment UI renders unchanged. New pricing logic
   * must read `accessType`, `purchasePrice` and `subscriptionPlans`.
   */
  price: number | null;
  purchasePrice: number | null;
  /** e.g. `"٤٩٠ ج.م"`. Null when the course is not sold outright. */
  purchasePriceLabel: string | null;
  accessType: CourseAccessType;
  /** Ordered as the instructor arranged them. Empty unless `accessType` is `SUBSCRIPTION`. */
  subscriptionPlans: SubscriptionPlanOption[];
  /** The viewing learner's own standing — what the CTA is decided from. */
  access: CourseAccess;
  structure: CourseStructure;
  currentLesson: { number: number; title: string; remaining: string };
  /**
   * Reading order across the whole course. A `MODULES` course fills this too, by
   * flattening its modules, so "continue learning" and the browse list keep working
   * without knowing which branch the course uses.
   */
  lessons: Lesson[];
  /** Populated only for a `MODULES` course. */
  modules: CurriculumModule[];
  /** The course final exam, when it has one. */
  finalQuiz: QuizView | null;
  /** True once the curriculum is finished and the final exam, if any, is passed. */
  courseCompleted: boolean;
  /** The lesson the server says to open next, or `null` when nothing is left. */
  nextLessonId: number | null;
}

/** @deprecated Local alias kept while components migrate to `StudentCourseModel`. */
export type CourseDetailData = StudentCourseModel;

// ── Checkout ──────────────────────────────────────────────────────────────────

export type CheckoutStep = "form" | "processing" | "success";

/** Which of the three checkout paths the modal is running. */
export type CheckoutKind = "free" | "purchase" | "subscription";

export interface CheckoutFormState {
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
  email: string;
}
