import { apiClient, type ApiResponse } from "@/shared/api";
import type { CourseRequest, InstructorCourseResponse } from "@/shared/courses";

const COURSE_BASE_V1 = "v1/instructor/courses";

/**
 * The three aggregate endpoints the rich editor is built on. The whole course tree —
 * metadata, structure, lessons, modules, every quiz, pricing and status — travels in a
 * single `CourseRequest`, so the editor never has to POST nested entities one by one.
 */
export function createCourseRequest(data: CourseRequest) {
  return apiClient.post<ApiResponse<InstructorCourseResponse>>(`/${COURSE_BASE_V1}`, data);
}

export function getInstructorCourseRequest(courseId: number) {
  return apiClient.get<ApiResponse<InstructorCourseResponse>>(`/${COURSE_BASE_V1}/${courseId}`);
}

export function updateCourseRequest(courseId: number, data: CourseRequest) {
  return apiClient.put<ApiResponse<InstructorCourseResponse>>(
    `/${COURSE_BASE_V1}/${courseId}`,
    data,
  );
}

export function uploadFileRequest(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post<ApiResponse<{ url: string }>>(`/v1/uploads`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
