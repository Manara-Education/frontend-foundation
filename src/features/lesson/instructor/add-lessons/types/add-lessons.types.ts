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
  imageUrl: string;
  price: number;
}

export type LessonInitial = Partial<Lesson>;
