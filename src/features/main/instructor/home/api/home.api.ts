import { apiClient, type ApiResponse } from "@/shared/api";
import type { Course } from "../types/home.types";

const COURSE_BASE_V1 = "v1/courses";

export function getMyCourses() {
  return apiClient.get<ApiResponse<Course[]>>(`/${COURSE_BASE_V1}/my-courses`);
}
