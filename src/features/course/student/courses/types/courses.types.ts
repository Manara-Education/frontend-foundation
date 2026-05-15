// Local DTO copies — do not import from parent course feature.

export interface Course {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  description?: string;
  duration?: number;
  lessonCount?: number;
  price?: number;
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

export type Status = "in-progress" | "completed" | "not-started";
export type FilterKey = "all" | Status;

export interface CourseView {
  id: number;
  title: string;
  instructor: string;
  description: string;
  image: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  status: Status;
  category: string;
  duration: string;
}

export interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  dot: string;
}

export interface FilterOption {
  key: FilterKey;
  label: string;
}

export interface CoursesViewState {
  isLoading: boolean;
  query: string;
  activeFilter: FilterKey;
  courses: CourseView[];
  filtered: CourseView[];
  total: number;
  completed: number;
  inProgress: number;
  error: string | null;
}
