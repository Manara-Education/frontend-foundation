/**
 * This screen still uses the legacy scoped lesson endpoints and a metadata-only course
 * update. Both are canonical contracts now — the types below are the shared ones, not
 * local copies.
 *
 * Migration point: the course editor aggregate (`CourseRequest` with `structure`,
 * `modules`, `finalQuiz`, `accessType`) replaces the scoped calls in a later phase.
 */
export type { CourseCardModel as Course } from "@/shared/courses";
export type { CourseRequest, LessonRequest } from "@/shared/courses";

/**
 * The instructor lesson list endpoint currently answers with the learner-shaped
 * `LessonResponse`, so its quiz — when the backend starts sending one — carries no
 * answer key. The authoring shape (`InstructorLessonResponse`) is only reachable
 * through the aggregate course editor endpoint.
 */
export type { LessonResponse as Lesson } from "@/shared/courses";

import type { LessonResponse } from "@/shared/courses";

export interface LessonFormErrors {
  title?: string;
  url?: string;
}

export interface LessonSavePayload {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  orderIndex: number;
}

export interface EditCourseFormData {
  title: string;
  description: string;
  /** Existing/kept cover image URL. Ignored when `imageFile` is set. */
  imageUrl: string;
  /** Newly selected cover image to upload, or null when unchanged/removed. */
  imageFile?: File | null;
  price: number;
}

export type LessonInitial = Partial<LessonResponse>;
