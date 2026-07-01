export type { Course } from "@/shared/courses";

export interface CourseRequest {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  price?: number;
}

export interface Lesson {
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

export interface LessonRequest {
  title: string;
  summary?: string;
  description?: string;
  videoUrl: string;
  duration?: string;
  orderIndex: number;
}

export interface LessonFormErrors {
  title?: string;
  url?: string;
}

export interface LessonSavePayload {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  orderIndex: number;
}

export interface EditCourseFormData {
  title: string;
  description: string;
  /** Existing/kept cover image URL. Ignored when `imageFile` is set. */
  imageUrl: string;
  /** Newly selected cover image to upload, or null when unchanged/removed. */
  imageFile?: File | null;
  price: number;
}

export type LessonInitial = Partial<Lesson>;
