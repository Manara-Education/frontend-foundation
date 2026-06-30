import { apiClient, type ApiResponse } from "@/shared/api";
import type { Course } from "./courses.types";

const COURSE_BASE_V1 = "v1/instructor/courses";

export function getMyCoursesRequest() {
  return apiClient.get<ApiResponse<Course[]>>(`/${COURSE_BASE_V1}/my-courses`);
}
