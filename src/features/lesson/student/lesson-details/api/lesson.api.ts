import { apiClient, unwrap, type ApiResponse } from "@/shared/api";
import type {
  CourseDetailsResponse,
  LessonCompletionResponse,
  LessonDetailsResponse,
} from "@/shared/courses";

const COURSE_BASE_V1 = "v1/student/courses";

export async function fetchLessonById(
  courseId: number,
  lessonId: number,
): Promise<LessonDetailsResponse> {
  const response = await apiClient.get<ApiResponse<LessonDetailsResponse>>(
    `/${COURSE_BASE_V1}/${courseId}/lessons/${lessonId}`,
  );
  return unwrap(response);
}

/**
 * The course behind the lesson, read for the header: its title and the learner's standing
 * in it, neither of which the lesson response carries.
 *
 * `ENROLLED` is the only view that answers with progress — the player is reached from a
 * course the learner has already joined.
 */
export async function fetchCourseSummary(courseId: number): Promise<CourseDetailsResponse> {
  const response = await apiClient.get<ApiResponse<CourseDetailsResponse>>(
    `/${COURSE_BASE_V1}/${courseId}`,
    { params: { mode: "ENROLLED" } },
  );
  return unwrap(response);
}

/**
 * Answers with the progression the completion produced, not an acknowledgement, so the
 * client refreshes from the server's answer instead of recomputing progress and unlocks.
 */
export async function markLessonCompleted(
  courseId: number,
  lessonId: number,
): Promise<LessonCompletionResponse> {
  const response = await apiClient.post<ApiResponse<LessonCompletionResponse>>(
    `/${COURSE_BASE_V1}/${courseId}/lessons/${lessonId}/complete`,
  );
  return unwrap(response);
}
