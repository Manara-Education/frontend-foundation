import { apiClient, type ApiResponse } from "@/shared/api";
import type {
  CourseRequest,
  InstructorCourseResponse,
  ModuleOrderRequest,
} from "@/shared/courses";

const COURSE_BASE_V1 = "v1/instructor/courses";

/**
 * The aggregate endpoints the rich editor is built on. The whole course tree — metadata,
 * structure, lessons, modules, every quiz and pricing — travels in a single
 * `CourseRequest`, so the editor never has to POST nested entities one by one.
 *
 * Two operations sit deliberately outside that aggregate:
 *
 * - **Publishing.** Whether learners can see the course is not something a content save
 *   should decide in passing. Sending it through the aggregate meant a tab holding an
 *   older copy of the course could unpublish it just by saving a lesson.
 * - **Module order.** A reorder that posts the whole course back overwrites whatever else
 *   changed in the meantime — drag a module in one tab and it undoes the rename made in
 *   another. The reorder command carries ids and nothing else.
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

/** Makes the course visible to learners, and makes now its version baseline. */
export function publishCourseRequest(courseId: number) {
  return apiClient.post<ApiResponse<InstructorCourseResponse>>(
    `/${COURSE_BASE_V1}/${courseId}/publish`,
  );
}

/** Withdraws the course from the catalogue. Content and enrolled learners are untouched. */
export function unpublishCourseRequest(courseId: number) {
  return apiClient.post<ApiResponse<InstructorCourseResponse>>(
    `/${COURSE_BASE_V1}/${courseId}/unpublish`,
  );
}

/**
 * Rewrites the module order from a list of ids, and answers with the reordered course.
 *
 * `signal` lets a superseded reorder be abandoned rather than raced: when an instructor
 * drags three times in a row, only the last request is allowed to finish.
 */
export function reorderCourseModulesRequest(
  courseId: number,
  data: ModuleOrderRequest,
  signal?: AbortSignal,
) {
  return apiClient.patch<ApiResponse<InstructorCourseResponse>>(
    `/${COURSE_BASE_V1}/${courseId}/modules/order`,
    data,
    { signal },
  );
}

export function uploadFileRequest(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post<ApiResponse<{ url: string }>>(`/v1/uploads`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
