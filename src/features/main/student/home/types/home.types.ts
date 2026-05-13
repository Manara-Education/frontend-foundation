export interface ContinueLesson {
  courseTitle: string;
  lessonTitle: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  image: string;
}

export interface EnrolledCourse {
  id: number;
  title: string;
  subtitle: string;
  progress: number;
  lessons: number;
  image: string;
  tag: string;
  tagColor: string;
}

export interface RecommendedCourse {
  id: number;
  title: string;
  desc: string;
  level: string;
  levelColor: string;
  rating: number;
  hours: number;
  image: string;
}

export interface HomeViewData {
  continueLesson: ContinueLesson;
  enrolledCourses: EnrolledCourse[];
  recommendations: RecommendedCourse[];
}
