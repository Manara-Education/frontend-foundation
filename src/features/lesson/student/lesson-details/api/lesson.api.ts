import { apiClient, unwrap, type ApiResponse } from "@/shared/api";
import type { LessonCompletionResponse, LessonDetailsResponse } from "@/shared/courses";

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
