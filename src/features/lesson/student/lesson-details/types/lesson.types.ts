/**
 * The lesson player reads the canonical lesson DTOs. `LessonResponse.quiz` is the
 * learner view, which has no answer key — the quiz player must score through the
 * backend rather than client-side.
 */
export type { LessonDetailsResponse, LessonRef, LessonResponse } from "@/shared/courses";

// ── Domain / view shape ───────────────────────────────────────────────────────
import type { LessonRef } from "@/shared/courses";

export type LessonStatus = "completed" | "current" | "not-started" | "locked";

export interface LessonView {
  id: number;
  number: number;
  title: string;
  duration: string;
  status: LessonStatus;
  videoUrl: string;
  description: string;
  previousLesson: LessonRef | null;
  nextLesson: LessonRef | null;
}
