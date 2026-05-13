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

export interface CreateCourseErrors {
  title?: string;
  description?: string;
  price?: string;
}
