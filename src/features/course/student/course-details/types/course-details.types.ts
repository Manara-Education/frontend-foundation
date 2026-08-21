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
  CourseAccessType,
  CourseStructure,
  SubscriptionPlanResponse,
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
  accessType: CourseAccessType;
  subscriptionPlans: SubscriptionPlanResponse[];
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

export interface CheckoutFormState {
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
  email: string;
}
