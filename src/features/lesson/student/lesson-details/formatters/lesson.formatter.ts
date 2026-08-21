import type { LessonStatus } from "../types/lesson.types";

export function toLessonStatus(isCompleted: boolean | null | undefined): LessonStatus {
  return isCompleted ? "completed" : "not-started";
}
