import { apiClient, type ApiResponse } from "@/shared/api";
import type { CourseResponse } from "@/shared/courses";

export function getExploreCourses() {
  return apiClient.get<ApiResponse<CourseResponse[]>>("/v1/student/courses");
}
