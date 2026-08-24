export interface InstructorPublicResponse {
  id: number;
  fullName: string;
  bio: string;
  specialization: string;
}

/** The instructor's public course list is the canonical course summary shape. */
export type { CourseResponse as InstructorCourse } from "@/shared/courses";
