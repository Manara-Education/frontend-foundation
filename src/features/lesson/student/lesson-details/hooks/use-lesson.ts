import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/shared/api";
import { loadCourseSummary, loadLesson, markLessonCompleted } from "../services/lesson.service";
import type {
  LessonCompletion,
  LessonCourseSummary,
  LessonRef,
  LessonView,
} from "../types/lesson.types";
import type { VideoSource } from "@/shared/video";

export interface UseLessonArgs {
  courseId: number;
  lessonId: number;
  onLessonChange?: (lessonId: number) => void;
}

export interface UseLessonResult {
  isLoading: boolean;
  error: string | null;
  currentLesson: LessonView | null;
  /** The course this lesson sits in, or `null` when its summary could not be read. */
  course: LessonCourseSummary | null;
  prevLesson: LessonRef | null;
  nextLesson: LessonRef | null;
  /** True when `nextLesson` exists but the curriculum has not opened it yet. */
  isNextLessonLocked: boolean;
  isMarkedComplete: boolean;
  isLocked: boolean;
  /** True while the lesson's quiz still stands between the learner and completion. */
  isQuizRequired: boolean;
  isCompleting: boolean;
  completionError: string | null;
  completion: LessonCompletion | null;
  description: string;
  /** The lesson's video, already resolved. Null when there is nothing playable to show. */
  video: VideoSource | null;
  navigateToLesson: (id: number) => void;
  markComplete: () => void;
  /** Called when the lesson's video reports that it reached its end. */
  handleVideoEnd: () => void;
}

export function useLesson({
  courseId,
  lessonId,
  onLessonChange,
}: UseLessonArgs): UseLessonResult {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonView | null>(null);
  const [course, setCourse] = useState<LessonCourseSummary | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [completion, setCompletion] = useState<LessonCompletion | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const isFirstLoad = reloadToken === 0;
    if (isFirstLoad) setIsLoading(true);
    setError(null);
    const lessonLoad = loadLesson(courseId, lessonId)
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
      });

    // Only the header's course chip and progress bar ride on this, so a course summary
    // that will not load leaves the lesson playable instead of failing the screen. It is
    // re-read alongside the lesson so the bar answers for the lesson just completed.
    const courseLoad = loadCourseSummary(courseId)
      .then((summary) => {
        if (!cancelled) setCourse(summary);
      })
      .catch((err) => {
        console.error("Failed to load course summary", err);
      });

    // The skeleton stays until both have answered: the header is then drawn once, with
    // its progress block already filled, rather than growing a row after it appears.
    Promise.all([lessonLoad, courseLoad]).finally(() => {
      if (!cancelled && isFirstLoad) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId, reloadToken]);

  // A completion is claimed at most once per lesson. The player can report the video's
  // end more than once — a replay ends too — and the claim must not be sent again for a
  // lesson the server has already been told about.
  const completionSubmittedRef = useRef(false);

  // Nothing is written back into a screen the learner has already left.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    completionSubmittedRef.current = false;
    setReloadToken(0);
    setCompletion(null);
    setCompletionError(null);
  }, [courseId, lessonId]);

  const isMarkedComplete = currentLesson?.status === "completed";
  const isLocked = currentLesson?.locked ?? false;
  const nextLesson = currentLesson?.nextLesson ?? null;

  /**
   * Whether the lesson the rail offers next may be opened.
   *
   * The lesson response names the next lesson without saying anything about its state, so
   * the verdict comes from the course's curriculum, re-read alongside the lesson. A course
   * summary that would not load leaves this false: the rail then offers the lesson and the
   * server refuses it there, which is better than locking a lesson on a guess.
   */
  const isNextLessonLocked =
    !!nextLesson && (course?.lockedLessonIds.includes(nextLesson.id) ?? false);
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
    if (isMarkedComplete || isCompleting || isLocked || completionSubmittedRef.current) return;
    completionSubmittedRef.current = true;
    setIsCompleting(true);
    setCompletionError(null);

    markLessonCompleted(courseId, lessonId)
      .then((result) => {
        if (!isMountedRef.current) return;
        setCompletion(result);
        // Re-read the lesson so its state, its quiz and the next lesson all come from
        // the server's new answer rather than from a local edit of the old one.
        setReloadToken((token) => token + 1);
      })
      .catch((err) => {
        console.error("Failed to mark lesson completed", err);
        // A refused claim is not a claim on record, so the next end of the video — or a
        // quiz passed afterwards — may ask again.
        completionSubmittedRef.current = false;
        if (!isMountedRef.current) return;
        setCompletionError(
          err instanceof ApiError
            ? err.errors[0] ?? "تعذر تسجيل إكمال الدرس، حاول مرة أخرى"
            : "تعذر تسجيل إكمال الدرس، حاول مرة أخرى",
        );
      })
      .finally(() => {
        if (isMountedRef.current) setIsCompleting(false);
      });
  }, [courseId, lessonId, isMarkedComplete, isCompleting, isLocked]);

  /**
   * The video reaching its end is what completes a lesson now, in place of a button.
   *
   * The quiz stays the backend's rule rather than the video's: a gated lesson is left
   * watched-but-incomplete here, and the quiz's own pass is what completes it.
   */
  const handleVideoEnd = useCallback(() => {
    if (isMarkedComplete || isLocked || isQuizRequired) return;
    markComplete();
  }, [isMarkedComplete, isLocked, isQuizRequired, markComplete]);

  return {
    isLoading,
    error,
    currentLesson,
    course,
    prevLesson: currentLesson?.previousLesson ?? null,
    nextLesson,
    isNextLessonLocked,
    isMarkedComplete,
    isLocked,
    isQuizRequired,
    isCompleting,
    completionError,
    completion,
    description: currentLesson?.description ?? "",
    video: currentLesson?.video ?? null,
    navigateToLesson,
    markComplete,
    handleVideoEnd,
  };
}
