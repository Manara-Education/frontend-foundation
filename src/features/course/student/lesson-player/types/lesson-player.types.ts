// ── Raw API DTOs (mirror backend) ─────────────────────────────────────────────
export interface Course {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  description?: string;
  duration?: number;
  lessonCount?: number;
  price: number;
  studentsCount?: number;
  instructorId?: number;
  instructorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  id: number;
  title: string;
  summary?: string;
  description?: string;
  videoId?: string;
  duration?: number;
  orderIndex: number;
  courseId: number;
  isCompleted?: boolean;
  createdAt?: string;
}

// ── Domain / view shape ───────────────────────────────────────────────────────
export type LessonStatus = "completed" | "current" | "not-started" | "locked";

export interface LessonView {
  id: number;
  number: number;
  title: string;
  duration: string;
  status: LessonStatus;
}

export interface CourseForPlayer {
  id: number;
  title: string;
  instructor: string;
  instructorTitle: string;
  totalLessons: number;
  completedLessons: number;
  lessons: LessonView[];
}

export interface LessonContent {
  description: string;
  keyPoints: string[];
  summary: string;
}
