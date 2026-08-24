import { toQuizView } from "@/features/quiz/student/quiz-player";
import { videoSourceFromResponse } from "@/shared/video";
import { toLessonStatus } from "../formatters/lesson.formatter";
import type {
  CourseDetailsResponse,
  LessonCompletion,
  LessonCompletionResponse,
  LessonCourseSummary,
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
    // Resolved from the response the server sent: its URL first, with the provider fields as the
    // fallback. A lesson saved before those fields existed resolves from its URL exactly as before.
    video: videoSourceFromResponse(lesson),
    description: lesson.description ?? "",
    locked: lesson.locked ?? false,
    quiz: lesson.quiz ? toQuizView(lesson.quiz) : null,
    previousLesson: previous ?? null,
    nextLesson: next ?? null,
  };
}

/**
 * Keeps the course's name and the learner's standing in it, and drops the curriculum the
 * course response carries — the player already has its own lesson.
 *
 * Only the branch matching the course's structure is populated, so both are walked: a
 * `FLAT` course counts `lessons`, a `MODULES` course the lessons under its modules.
 * `lessonCount` is the server's own total and is preferred over the length of whichever
 * branch answered. The walk also collects which of those lessons are still locked, which
 * is what tells the navigation rail that the next lesson cannot be opened yet.
 */
export function toCourseSummary(dto: CourseDetailsResponse): LessonCourseSummary {
  const lessons = [
    ...(dto.lessons ?? []),
    ...(dto.modules ?? []).flatMap((module) => module.lessons),
  ];

  return {
    id: dto.course.id,
    title: dto.course.title,
    totalLessons: dto.course.lessonCount ?? lessons.length,
    completedLessons: lessons.filter((lesson) => lesson.isCompleted).length,
    progress: dto.progress ?? null,
    lockedLessonIds: lessons.filter((lesson) => lesson.locked).map((lesson) => lesson.id),
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
