import { useEffect, useMemo, useState } from "react";
import {
  calcProgress,
  getLessonContent,
  getVideoId,
} from "../formatters/lesson-player.formatter";
import { lessonPlayerService } from "../services/lesson-player.service";
import type {
  CourseForPlayer,
  LessonContent,
  LessonView,
} from "../types/lesson-player.types";

export interface UseLessonPlayerArgs {
  courseId: number;
  lessonId: number;
  onLessonChange?: (lessonId: number) => void;
}

export interface UseLessonPlayerResult {
  isLoading: boolean;
  course: CourseForPlayer | null;
  currentLesson: LessonView | null;
  currentLessonId: number;
  prevLesson: LessonView | null;
  nextLesson: LessonView | null;
  isMarkedComplete: boolean;
  completedCount: number;
  progress: number;
  lessonContent: LessonContent;
  videoId: string;
  navigateToLesson: (id: number) => void;
  markComplete: () => void;
}

export function useLessonPlayer({
  courseId,
  lessonId,
  onLessonChange,
}: UseLessonPlayerArgs): UseLessonPlayerResult {
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<CourseForPlayer | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState(lessonId);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(new Set());

  // Load course
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const data = await lessonPlayerService.loadCourseForPlayer(courseId);
        if (cancelled) return;
        setCourse(data);
        setCompletedLessonIds(
          new Set(data.lessons.filter((l) => l.status === "completed").map((l) => l.id)),
        );
      } catch (err) {
        console.error("Failed to load lesson player course", err);
      } finally {
        if (!cancelled) {
          // hold skeleton briefly to preserve original UX
          setTimeout(() => {
            if (!cancelled) setIsLoading(false);
          }, 400);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // Sync external lessonId
  useEffect(() => {
    setCurrentLessonId(lessonId);
  }, [lessonId]);

  // Trigger short loading on lesson change (preserve original behavior)
  useEffect(() => {
    if (!course) return;
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, [currentLessonId, course]);

  const currentLesson = useMemo<LessonView | null>(() => {
    if (!course) return null;
    return course.lessons.find((l) => l.id === currentLessonId) ?? course.lessons[0] ?? null;
  }, [course, currentLessonId]);

  const { prevLesson, nextLesson } = useMemo<{
    prevLesson: LessonView | null;
    nextLesson: LessonView | null;
  }>(() => {
    if (!course) return { prevLesson: null, nextLesson: null };
    const idx = course.lessons.findIndex((l) => l.id === currentLessonId);
    return {
      prevLesson: idx > 0 ? course.lessons[idx - 1] : null,
      nextLesson:
        idx >= 0 && idx < course.lessons.length - 1 ? course.lessons[idx + 1] : null,
    };
  }, [course, currentLessonId]);

  const isMarkedComplete = completedLessonIds.has(currentLessonId);
  const completedCount = completedLessonIds.size;
  const totalLessons = course?.totalLessons ?? 0;
  const progress = calcProgress(completedCount, totalLessons);
  const lessonContent = getLessonContent(currentLessonId);
  const videoId = getVideoId(currentLesson?.number ?? 1);

  function navigateToLesson(id: number) {
    setCurrentLessonId(id);
    onLessonChange?.(id);
  }

  function markComplete() {
    if (completedLessonIds.has(currentLessonId)) return;
    setCompletedLessonIds((prev) => new Set([...prev, currentLessonId]));
    lessonPlayerService.markLessonCompleted(courseId, currentLessonId).catch((err) => {
      console.error("Failed to mark lesson completed", err);
    });
  }

  return {
    isLoading,
    course,
    currentLesson,
    currentLessonId,
    prevLesson,
    nextLesson,
    isMarkedComplete,
    completedCount,
    progress,
    lessonContent,
    videoId,
    navigateToLesson,
    markComplete,
  };
}
