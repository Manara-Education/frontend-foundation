export type Status = "in-progress" | "completed" | "not-started";
export type FilterKey = "all" | Status;

export interface CourseViewDto {
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
  /**
   * Whether the course changed after this learner could last have seen it.
   *
   * The backend's answer. Optional on the DTO because a payload from an older backend
   * does not carry it; the mapper reads a missing value as "no updates".
   */
  hasUpdatesSincePublish?: boolean | null;
}

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
  /** Whether the course changed after this learner could last have seen it. */
  hasUpdatesSincePublish: boolean;
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
