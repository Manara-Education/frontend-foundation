import { apiClient, type ApiResponse } from "@/shared/api";
import type { Course, CourseRequest } from "../types/create-course.types";

const COURSE_BASE_V1 = "v1/instructor/courses";

export function createCourse(data: CourseRequest) {
  return apiClient.post<ApiResponse<Course>>(`/${COURSE_BASE_V1}`, data);
}

export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post<ApiResponse<{ url: string }>>(`/v1/uploads`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
