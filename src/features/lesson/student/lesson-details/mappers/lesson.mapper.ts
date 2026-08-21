import { toQuizView } from "@/features/quiz/student/quiz-player";
import { toLessonStatus } from "../formatters/lesson.formatter";
import type {
  LessonCompletion,
  LessonCompletionResponse,
  LessonDetailsResponse,
  LessonView,
} from "../types/lesson.types";

export function toLessonView(details: LessonDetailsResponse): LessonView {
  const { lesson, previous, next } = details;

  return {
    id: lesson.id,
    number: lesson.orderIndex,
    title: lesson.title,
    duration: lesson.duration ?? "",
    status: toLessonStatus(lesson),
    videoUrl: lesson.videoUrl ?? "",
    description: lesson.description ?? "",
    locked: lesson.locked ?? false,
    quiz: lesson.quiz ? toQuizView(lesson.quiz) : null,
    previousLesson: previous ?? null,
    nextLesson: next ?? null,
  };
}

export function toLessonCompletion(dto: LessonCompletionResponse): LessonCompletion {
  return {
    lessonId: dto.lessonId,
    completed: dto.completed ?? false,
    courseProgress: dto.courseProgress ?? 0,
    nextLessonId: dto.nextLessonId ?? null,
    courseCompleted: dto.courseCompleted ?? false,
  };
}
