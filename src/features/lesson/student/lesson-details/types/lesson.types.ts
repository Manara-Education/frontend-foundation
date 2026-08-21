/**
 * The lesson player reads the canonical lesson DTOs. `LessonResponse.quiz` is the
 * learner view, which has no answer key — the quiz player scores through the backend
 * rather than client-side.
 */
export type {
  LessonCompletionResponse,
  LessonDetailsResponse,
  LessonRef,
  LessonResponse,
} from "@/shared/courses";

// ── Domain / view shape ───────────────────────────────────────────────────────
import type { LessonRef } from "@/shared/courses";
import type { QuizView } from "@/features/quiz/student/quiz-player";

export type LessonStatus = "completed" | "current" | "not-started" | "locked";

export interface LessonView {
  id: number;
  number: number;
  title: string;
  duration: string;
  status: LessonStatus;
  videoUrl: string;
  description: string;
  /**
   * True when the curriculum has not opened this lesson. The request still succeeds —
   * the backend answers with the row's title and position and withholds the content —
   * so this, not the HTTP status, is what says whether the lesson may be played.
   */
  locked: boolean;
  /** The lesson's quiz, or `null` when it has none or the lesson is locked. */
  quiz: QuizView | null;
  previousLesson: LessonRef | null;
  nextLesson: LessonRef | null;
}

/** What completing a lesson changed, as the server reported it. */
export interface LessonCompletion {
  lessonId: number;
  completed: boolean;
  /** Percentage of the course's lessons now complete, 0–100. */
  courseProgress: number;
  /** The lesson to open next, or `null` when nothing is left to open. */
  nextLessonId: number | null;
  courseCompleted: boolean;
}
