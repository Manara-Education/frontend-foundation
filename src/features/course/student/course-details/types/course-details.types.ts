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
  LessonResponse as LessonApi,
} from "@/shared/courses";

import type {
  CourseAccessType,
  CourseStructure,
  SubscriptionPlanResponse,
} from "@/shared/courses";

// ── Domain / view shapes ──────────────────────────────────────────────────────

export type LessonStatus = "completed" | "current" | "not-started" | "locked";

export type CourseDetailsMode = "enrolled" | "browse";

export interface Lesson {
  id: number;
  number: number;
  title: string;
  duration: string;
  status: LessonStatus;
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
  /**
   * `MODULES` courses currently have their module lessons flattened into `lessons` so
   * the existing curriculum UI keeps working. The module tree itself lands with the
   * module UI.
   */
  structure: CourseStructure;
  currentLesson: { number: number; title: string; remaining: string };
  lessons: Lesson[];
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
