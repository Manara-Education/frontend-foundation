import { apiClient, type ApiResponse } from "@/shared/api";
import type { CourseResponse } from "./courses.types";

const COURSE_BASE_V1 = "v1/instructor/courses";

export function getMyCoursesRequest() {
  return apiClient.get<ApiResponse<CourseResponse[]>>(`/${COURSE_BASE_V1}/my-courses`);
}
