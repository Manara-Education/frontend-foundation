import * as api from "../api/lesson.api";
import { toLessonCompletion, toLessonView } from "../mappers/lesson.mapper";
import type { LessonCompletion, LessonView } from "../types/lesson.types";

export async function loadLesson(
  courseId: number,
  lessonId: number,
): Promise<LessonView> {
  const lesson = await api.fetchLessonById(courseId, lessonId);
  return toLessonView(lesson);
}

/**
 * Completing a lesson is the learner's claim; whether it counts is the server's
 * decision. A lesson carrying a quiz stays incomplete until that quiz is passed, and the
 * refusal comes back as an `ApiError` for the caller to surface.
 */
export async function markLessonCompleted(
  courseId: number,
  lessonId: number,
): Promise<LessonCompletion> {
  const completion = await api.markLessonCompleted(courseId, lessonId);
  return toLessonCompletion(completion);
}
