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

export type LessonStatus = "completed" | "current" | "not-started" | "locked";

export interface LessonView {
  id: number;
  number: number;
  title: string;
  duration: string;
  status: LessonStatus;
}

export interface CourseDetailData {
  id: number;
  title: string;
  instructor: string;
  instructorTitle: string;
  instructorBio: string;
  instructorStudents: number;
  instructorCourses: number;
  instructorImage: string;
  description: string;
  outcomes: string[];
  skills: string[];
  image: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  totalDuration: string;
  students: number;
  rating: number;
  category: string;
  currentLesson?: { number: number; title: string; remaining: string };
  lessons: LessonView[];
}
