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
  ContentChangeState,
  CourseAccessType,
  CourseStructure,
  EntitlementSource,
  LessonContentType,
  RemovedContentResponse,
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

/**
 * What to say about one curriculum row, for the learner reading it.
 *
 * The server's decision, carried through untouched. Nothing on this screen knows when the
 * learner enrolled, and nothing needs to: shipping an enrolment date to the browser to
 * compare it here would be the server's rule implemented a second time.
 */
export interface ContentChange {
  state: ContentChangeState;
  /** Already localised server-side — "تم تحديث محتوى الدرس". `null` when there is no wording. */
  summary: string | null;
}

/** Nothing to say about this row. Shared so every mapper spells "unchanged" the same way. */
export const UNCHANGED: ContentChange = { state: "UNCHANGED", summary: null };

export interface Lesson {
  id: number;
  number: number;
  title: string;
  duration: string;
  /**
   * What this lesson teaches with, carried on the curriculum row so it can be drawn honestly: a
   * lesson that is read has no running time to print.
   *
   * Present on locked rows too — which kind of lesson it is belongs to the listing, not to the
   * content the lock is withholding.
   */
  contentType: LessonContentType;
  status: LessonStatus;
  /** The lesson's own quiz, when the learner may see it. */
  quiz: QuizView | null;
  /** Whether this lesson is new or updated since the reader enrolled. */
  change: ContentChange;
  /** The lesson quiz's own state, kept apart: a changed quiz is not a changed lesson. */
  quizChange: ContentChange;
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
  /** The module's own state — its title and description, not its contents. */
  change: ContentChange;
  /** The module exam's own state. */
  quizChange: ContentChange;
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
  /**
   * Whether the course has changed since **the reader** enrolled.
   *
   * The backend's answer, carried through untouched — the same field My Courses reads, so
   * the two screens cannot disagree about the same course. False for a visitor browsing
   * the catalogue, who has no enrolment to measure against.
   */
  hasUpdatesSinceEnrollment: boolean;
  /** The final exam's own state. */
  finalQuizChange: ContentChange;
  /**
   * Content that was in the course when the reader enrolled and is not in it now.
   *
   * Kept at course level because there is no curriculum row left to hang it on. Without
   * it a learner's course simply loses a lesson between two visits, with the progress bar
   * moving for no visible reason.
   */
  removedContent: RemovedContentResponse[];
}

/** @deprecated Local alias kept while components migrate to `StudentCourseModel`. */
export type CourseDetailData = StudentCourseModel;

// ── Checkout ──────────────────────────────────────────────────────────────────

export type CheckoutStep = "form" | "processing" | "success";

/** Which of the three checkout paths the modal is running. */
export type CheckoutKind = "free" | "purchase" | "subscription";

/**
 * What checkout collects.
 *
 * `cardNumber`, `expiry` and `cvc` used to be here and were removed deliberately. There is no
 * payment provider behind this application, and the backend stopped accepting those fields —
 * they were being transmitted and then dropped at the network boundary, so the only thing the
 * form achieved was moving real card numbers and CVCs across the wire for nothing.
 */
export interface CheckoutFormState {
  name: string;
  email: string;
}
