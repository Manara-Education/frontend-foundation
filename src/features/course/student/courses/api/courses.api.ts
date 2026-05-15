import { apiClient, type ApiResponse } from "@/shared/api";
import type { Course } from "../types/courses.types";

const COURSE_BASE_V1 = "v1/courses";

// HTTP endpoint scaffolding for the student courses list view.
// Currently unused at runtime — the view ships with curated mock data preserved
// from the legacy implementation. Kept here so swapping to the real backend
// is a one-line change in the service.
export function getMyCourses() {
  return apiClient.get<ApiResponse<Course[]>>(`/${COURSE_BASE_V1}`);
}
