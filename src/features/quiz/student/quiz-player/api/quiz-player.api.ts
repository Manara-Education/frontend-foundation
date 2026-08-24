import { apiClient, unwrap, type ApiResponse } from "@/shared/api";
import type { QuizAttemptResponse, QuizSubmissionRequest } from "@/shared/courses";

const STUDENT_COURSE_BASE_V1 = "v1/student/courses";

/**
 * Scoped under the course on purpose: the course in the path is what the quiz is
 * authorized against, so a quiz can never be submitted through a course it does not
 * belong to.
 */
export async function submitQuizAttempt(
  courseId: number,
  quizId: string,
  payload: QuizSubmissionRequest,
): Promise<QuizAttemptResponse> {
  const response = await apiClient.post<ApiResponse<QuizAttemptResponse>>(
    `/${STUDENT_COURSE_BASE_V1}/${courseId}/quizzes/${quizId}/submit`,
    payload,
  );
  return unwrap(response);
}
