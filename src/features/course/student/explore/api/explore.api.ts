import { apiClient, type ApiResponse } from "@/shared/api";
import type { CourseExploreDto } from "../types/explore.types";

export function getExploreCourses() {
  return apiClient.get<ApiResponse<CourseExploreDto[]>>("/v1/student/courses");
}
