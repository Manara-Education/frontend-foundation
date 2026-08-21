import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/api";
import { loadLesson, markLessonCompleted } from "../services/lesson.service";
import type { LessonCompletion, LessonRef, LessonView } from "../types/lesson.types";

export interface UseLessonArgs {
  courseId: number;
  lessonId: number;
  onLessonChange?: (lessonId: number) => void;
}

export interface UseLessonResult {
  isLoading: boolean;
  error: string | null;
  currentLesson: LessonView | null;
  prevLesson: LessonRef | null;
  nextLesson: LessonRef | null;
  isMarkedComplete: boolean;
  isLocked: boolean;
  /** True while the lesson's quiz still stands between the learner and completion. */
  isQuizRequired: boolean;
  isCompleting: boolean;
  completionError: string | null;
  completion: LessonCompletion | null;
  description: string;
  videoUrl: string;
  navigateToLesson: (id: number) => void;
  markComplete: () => void;
}

export function useLesson({
  courseId,
  lessonId,
  onLessonChange,
}: UseLessonArgs): UseLessonResult {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonView | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [completion, setCompletion] = useState<LessonCompletion | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const isFirstLoad = reloadToken === 0;
    if (isFirstLoad) setIsLoading(true);
    setError(null);
    loadLesson(courseId, lessonId)
      .then((lesson) => {
        if (!cancelled) setCurrentLesson(lesson);
      })
      .catch((err) => {
        console.error("Failed to load lesson", err);
        if (cancelled) return;
        if (err instanceof ApiError) {
          setError(`${err.statusCode}: ${err.errors.join(", ") || err.message}`);
        } else {
          setError(err?.message ?? "Unknown error");
        }
      })
      .finally(() => {
        if (!cancelled && isFirstLoad) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId, reloadToken]);

  useEffect(() => {
    setReloadToken(0);
    setCompletion(null);
    setCompletionError(null);
  }, [courseId, lessonId]);

  const isMarkedComplete = currentLesson?.status === "completed";
  const isLocked = currentLesson?.locked ?? false;
  const quiz = currentLesson?.quiz ?? null;
  const isQuizRequired = !!quiz && !quiz.passed && !isMarkedComplete;

  function navigateToLesson(id: number) {
    onLessonChange?.(id);
  }

  /**
   * Sends the claim and keeps whatever the server answers.
   *
   * Nothing is marked complete optimistically: a lesson whose quiz is unpassed, or one
   * the curriculum has not opened, is refused here, and the refusal is what the learner
   * sees rather than a tick that silently disagrees with the server.
   */
  const markComplete = useCallback(() => {
    if (isMarkedComplete || isCompleting || isLocked) return;
    setIsCompleting(true);
    setCompletionError(null);

    markLessonCompleted(courseId, lessonId)
      .then((result) => {
        setCompletion(result);
        // Re-read the lesson so its state, its quiz and the next lesson all come from
        // the server's new answer rather than from a local edit of the old one.
        setReloadToken((token) => token + 1);
      })
      .catch((err) => {
        console.error("Failed to mark lesson completed", err);
        setCompletionError(
          err instanceof ApiError
            ? err.errors[0] ?? "تعذر تسجيل إكمال الدرس، حاول مرة أخرى"
            : "تعذر تسجيل إكمال الدرس، حاول مرة أخرى",
        );
      })
      .finally(() => setIsCompleting(false));
  }, [courseId, lessonId, isMarkedComplete, isCompleting, isLocked]);

  return {
    isLoading,
    error,
    currentLesson,
    prevLesson: currentLesson?.previousLesson ?? null,
    nextLesson: currentLesson?.nextLesson ?? null,
    isMarkedComplete,
    isLocked,
    isQuizRequired,
    isCompleting,
    completionError,
    completion,
    description: currentLesson?.description ?? "",
    videoUrl: currentLesson?.videoUrl ?? "",
    navigateToLesson,
    markComplete,
  };
}
