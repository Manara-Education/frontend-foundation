import type { LessonResponse, LessonStatus } from "../types/lesson.types";

/**
 * A locked lesson outranks a completed one: the backend only reports completion for a
 * viewer it tracks progress for, so "locked" is the answer whenever it is set.
 */
export function toLessonStatus(lesson: LessonResponse): LessonStatus {
  if (lesson.locked) return "locked";
  if (lesson.isCompleted) return "completed";
  return "not-started";
}
