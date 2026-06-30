import * as api from "../api/lesson.api";
import { toLessonView } from "../mappers/lesson.mapper";
import type { LessonView } from "../types/lesson.types";

export async function loadLesson(
  courseId: number,
  lessonId: number,
): Promise<LessonView> {
  const lesson = await api.fetchLessonById(courseId, lessonId);
  return toLessonView(lesson);
}

export async function markLessonCompleted(
  courseId: number,
  lessonId: number,
): Promise<void> {
  await api.markLessonCompleted(courseId, lessonId);
}
