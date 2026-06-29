import { apiClient, type ApiResponse, type MessageResponse } from "@/shared/api";
import type { Course, CourseRequest, Lesson, LessonRequest } from "../types/add-lessons.types";

const COURSE_BASE_V1 = "v1/instructor/courses";

export function getMyCourses() {
  return apiClient.get<ApiResponse<Course[]>>(`/v1/courses/my-courses`);
}

export function updateCourse(courseId: number, data: CourseRequest) {
  return apiClient.put<ApiResponse<Course>>(`/${COURSE_BASE_V1}/${courseId}`, data);
}

export function getCourseLessons(courseId: number) {
  return apiClient.get<ApiResponse<Lesson[]>>(`/${COURSE_BASE_V1}/${courseId}/lessons`);
}

export function addLesson(courseId: number, data: LessonRequest) {
  return apiClient.post<ApiResponse<Lesson>>(`/${COURSE_BASE_V1}/${courseId}/lessons`, data);
}

export function updateLesson(courseId: number, lessonId: number, data: LessonRequest) {
  return apiClient.put<ApiResponse<Lesson>>(
    `/${COURSE_BASE_V1}/${courseId}/lessons/${lessonId}`,
    data,
  );
}

export function deleteLesson(courseId: number, lessonId: number) {
  return apiClient.delete<ApiResponse<MessageResponse>>(
    `/${COURSE_BASE_V1}/${courseId}/lessons/${lessonId}`,
  );
}
