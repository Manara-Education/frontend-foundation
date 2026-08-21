import { apiClient, type ApiResponse, type MessageResponse } from "@/shared/api";
import type {
  CourseRequest,
  InstructorCourseResponse,
  LessonRequest,
  LessonResponse,
} from "@/shared/courses";

const COURSE_BASE_V1 = "v1/instructor/courses";

export function updateCourse(courseId: number, data: CourseRequest) {
  return apiClient.put<ApiResponse<InstructorCourseResponse>>(
    `/${COURSE_BASE_V1}/${courseId}`,
    data,
  );
}

export function uploadFile(file: File) {
  return apiClient.post<ApiResponse<{ url: string }>>(`/v1/uploads`, toFormData(file), {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

function toFormData(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

export function getCourseLessons(courseId: number) {
  return apiClient.get<ApiResponse<LessonResponse[]>>(`/${COURSE_BASE_V1}/${courseId}/lessons`);
}

export function addLesson(courseId: number, data: LessonRequest) {
  return apiClient.post<ApiResponse<LessonResponse>>(
    `/${COURSE_BASE_V1}/${courseId}/lessons`,
    data,
  );
}

export function updateLesson(courseId: number, lessonId: number, data: LessonRequest) {
  return apiClient.put<ApiResponse<LessonResponse>>(
    `/${COURSE_BASE_V1}/${courseId}/lessons/${lessonId}`,
    data,
  );
}

export function deleteLesson(courseId: number, lessonId: number) {
  return apiClient.delete<ApiResponse<MessageResponse>>(
    `/${COURSE_BASE_V1}/${courseId}/lessons/${lessonId}`,
  );
}
