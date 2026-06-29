import { apiClient, type ApiResponse } from "@/shared/api";
import type { LessonDetailsResponse } from "../types/lesson.types";

const COURSE_BASE_V1 = "v1/student/courses";

export async function fetchLessonById(
  courseId: number,
  lessonId: number,
): Promise<LessonDetailsResponse> {
  const { data } = await apiClient.get<ApiResponse<LessonDetailsResponse>>(
    `/${COURSE_BASE_V1}/${courseId}/lessons/${lessonId}`,
  );
  return data.data!;
}

export async function markLessonCompleted(
  courseId: number,
  lessonId: number,
): Promise<void> {
  await apiClient.post<ApiResponse<void>>(
    `/${COURSE_BASE_V1}/${courseId}/lessons/${lessonId}/complete`,
  );
}
