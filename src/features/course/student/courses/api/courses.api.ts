import { apiClient, type ApiResponse } from "@/shared/api";
import type { CourseViewDto } from "../types/courses.types";

const DASHBOARD_BASE_V1 = "v1/dashboard/student";

export function getMyCourses() {
  return apiClient.get<ApiResponse<CourseViewDto[]>>(`/${DASHBOARD_BASE_V1}`);
}
