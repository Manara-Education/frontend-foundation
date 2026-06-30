// ── Raw API DTOs (mirror backend) ─────────────────────────────────────────────
export interface LessonRef {
  id: number;
  title: string;
}

export interface LessonResponse {
  id: number;
  title: string;
  summary?: string;
  description?: string;
  videoUrl?: string;
  duration?: string;
  orderIndex: number;
  courseId: number;
  isCompleted?: boolean;
  createdAt?: string;
}

export interface LessonDetailsResponse {
  lesson: LessonResponse;
  previous?: LessonRef | null;
  next?: LessonRef | null;
}

// ── Domain / view shape ───────────────────────────────────────────────────────
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
