import { useEffect, useState } from "react";
import { ApiError } from "@/shared/api";
import { loadLesson, markLessonCompleted } from "../services/lesson.service";
import type { LessonRef, LessonView } from "../types/lesson.types";

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
  const [isMarkedComplete, setIsMarkedComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    loadLesson(courseId, lessonId)
      .then((lesson) => {
        if (cancelled) return;
        setCurrentLesson(lesson);
        setIsMarkedComplete(lesson.status === "completed");
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
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  function navigateToLesson(id: number) {
    onLessonChange?.(id);
  }

  function markComplete() {
    if (isMarkedComplete) return;
    setIsMarkedComplete(true);
    markLessonCompleted(courseId, lessonId).catch((err) => {
      console.error("Failed to mark lesson completed", err);
    });
  }

  return {
    isLoading,
    error,
    currentLesson,
    prevLesson: currentLesson?.previousLesson ?? null,
    nextLesson: currentLesson?.nextLesson ?? null,
    isMarkedComplete,
    description: currentLesson?.description ?? "",
    videoUrl: currentLesson?.videoUrl ?? "",
    navigateToLesson,
    markComplete,
  };
}
