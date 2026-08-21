import { apiClient, unwrap, type ApiResponse, type MessageResponse } from "@/shared/api";
import type { LessonDetailsResponse } from "@/shared/courses";

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

export async function markLessonCompleted(
  courseId: number,
  lessonId: number,
): Promise<void> {
  await apiClient.post<ApiResponse<MessageResponse>>(
    `/${COURSE_BASE_V1}/${courseId}/lessons/${lessonId}/complete`,
  );
}
