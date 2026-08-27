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
   * Whether the instructor has edited the course since they last published it.
   *
   * The same value for every learner, because it describes the author's workflow. Kept so
   * a payload from either backend deserialises, but not what the card should read.
   *
   * @deprecated for learner-facing use — see `hasUpdatesSinceEnrollment`.
   */
  hasUpdatesSincePublish?: boolean | null;
  /**
   * Whether the course changed after **this** learner enrolled.
   *
   * The backend's answer, per enrolment: two students of one course get different values
   * on their own dashboards. Optional because a payload from an older backend does not
   * carry it; the mapper reads a missing value as "no updates".
   */
  hasUpdatesSinceEnrollment?: boolean | null;
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
  /**
   * Whether the course changed after this learner enrolled — what the card's badge reads.
   *
   * One boolean, decided on the server. The card does not know when the learner enrolled
   * and deliberately never will: comparing an enrolment date to a content timestamp in
   * React is the server's rule implemented a second time, and two implementations of one
   * rule are two answers waiting to disagree.
   */
  hasUpdatesSinceEnrollment: boolean;
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
