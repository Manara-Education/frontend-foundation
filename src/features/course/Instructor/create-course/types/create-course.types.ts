/**
 * This screen still submits the metadata-only slice of the course aggregate. The
 * request type is the canonical `CourseRequest`, so the fields it does not send yet
 * (`structure`, `lessons`, `modules`, `finalQuiz`, `accessType`, `subscriptionPlans`,
 * `status`) are visible here rather than missing from the contract.
 *
 * Migration point: the multi-step editor sends the full aggregate and maps its state
 * through `mapCourseEditorStateToCourseRequest`.
 */
export type { CourseRequest, InstructorCourseResponse } from "@/shared/courses";

export interface CreateCourseErrors {
  title?: string;
  description?: string;
  price?: string;
}
