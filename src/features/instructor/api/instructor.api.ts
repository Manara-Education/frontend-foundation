import { apiClient, type ApiResponse } from "@/shared/api";
import type { InstructorCourse, InstructorPublicResponse } from "../types/instructor.types";

const INSTRUCTOR_BASE_V1 = "v1/instructors";

export function getInstructorProfile(instructorId: number) {
  return apiClient.get<ApiResponse<InstructorPublicResponse>>(`/${INSTRUCTOR_BASE_V1}/${instructorId}`);
}

export function getInstructorCourses(instructorId: number) {
  return apiClient.get<ApiResponse<InstructorCourse[]>>(`/${INSTRUCTOR_BASE_V1}/${instructorId}/courses`);
}
