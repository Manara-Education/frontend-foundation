import type { LessonStatus } from "../types/course-details.types";

export function formatMinutesLabel(value: number | string | undefined): string {
  return `${value ?? 0} دقيقة`;
}

export function toLessonStatus(isCompleted: boolean | undefined): LessonStatus {
  return isCompleted ? "completed" : "not-started";
}
