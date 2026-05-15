export interface InstructorPublicResponse {
  id: number;
  fullName: string;
  bio: string;
  specialization: string;
}

export interface InstructorCourse {
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
