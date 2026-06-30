import { toLessonStatus } from "../formatters/lesson.formatter";
import type { LessonDetailsResponse, LessonView } from "../types/lesson.types";

export function toLessonView(details: LessonDetailsResponse): LessonView {
  const { lesson, previous, next } = details;
  return {
    id: lesson.id,
    number: lesson.orderIndex,
    title: lesson.title,
    duration: lesson.duration ?? "",
    status: toLessonStatus(lesson.isCompleted),
    videoUrl: lesson.videoUrl ?? "",
    description: lesson.description ?? "",
    previousLesson: previous ?? null,
    nextLesson: next ?? null,
  };
}
