import { apiClient, type ApiResponse } from "@/shared/api";
import type { Course, Lesson } from "../types/course-details.types";

const COURSE_BASE_V1 = "v1/courses";

export function getCourseById(courseId: number) {
  return apiClient.get<ApiResponse<Course>>(`/${COURSE_BASE_V1}/${courseId}`);
}

export function getCourseLessons(courseId: number) {
  return apiClient.get<ApiResponse<Lesson[]>>(`/${COURSE_BASE_V1}/${courseId}/lessons`);
}
