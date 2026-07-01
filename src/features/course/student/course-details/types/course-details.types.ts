export type LessonStatus = "completed" | "current" | "not-started" | "locked";

export type CourseDetailsMode = "enrolled" | "browse";

export type CourseViewMode = "ENROLLED" | "DISCOVER";

export interface CourseInfoApi {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  description: string | null;
  duration: string | null;
  remainingDuration: string | null;
  lessonCount: number | null;
  price: number | null;
  studentsCount: number | null;
  createdAt: string | null;
}

export interface InstructorInfoApi {
  id: number;
  fullName: string;
  email: string | null;
  bio: string | null;
  specialization: string | null;
}

export interface LessonApi {
  id: number;
  title: string;
  summary: string | null;
  description: string | null;
  videoId: string | null;
  duration: string | null;
  orderIndex: number;
  courseId: number;
  isCompleted: boolean | null;
  createdAt: string | null;
}

export interface CourseDetailsApiResponse {
  course: CourseInfoApi;
  instructor: InstructorInfoApi;
  lessons: LessonApi[];
}

export interface LessonResponse {
  id: number;
  number: number;
  title: string;
  duration: string;
  status: LessonStatus;
}

export interface CourseDetailResponse {
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
  remainingDuration: string;
  students: number;
  rating: number;
  category: string;
  price: number | null;
  currentLesson: { number: number; title: string; remaining: string };
  lessons: LessonResponse[];
}

export type Lesson = LessonResponse;
export type CourseDetailData = CourseDetailResponse;

export type CheckoutStep = "form" | "processing" | "success";

export interface CheckoutFormState {
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
  email: string;
}
