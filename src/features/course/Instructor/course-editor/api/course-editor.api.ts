import { apiClient, type ApiResponse } from "@/shared/api";
import type {
  CourseRequest,
  InstructorCourseResponse,
  LessonOrderRequest,
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
 * - **Order.** Three commands, one per ordered scope a course has: its modules, the root
 *   lessons of a flat course, and the lessons inside one module. A reorder that posts the
 *   whole course back overwrites whatever else changed in the meantime — drag a module in
 *   one tab and it undoes the rename made in another. Each command carries ids and nothing
 *   else, and the scope it applies to is named by the URL rather than the body.
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

/**
 * Rewrites the root lesson order of a flat course, and answers with the reordered course.
 *
 * A flat course's lessons sit under no module, which is the scope this addresses. The
 * modular equivalent is `reorderModuleLessonsRequest` — they are different scopes and
 * different URLs, never the same call with a different argument.
 */
export function reorderCourseLessonsRequest(
  courseId: number,
  data: LessonOrderRequest,
  signal?: AbortSignal,
) {
  return apiClient.patch<ApiResponse<InstructorCourseResponse>>(
    `/${COURSE_BASE_V1}/${courseId}/lessons/order`,
    data,
    { signal },
  );
}

/**
 * Rewrites the lesson order inside one module, and answers with the reordered course.
 *
 * The module is in the path, so the scope cannot be lost between the drag and the commit —
 * which is precisely how the previous wiring went wrong: dragging a lesson inside a module
 * called the *module* order endpoint, so the lesson order was never persisted at all.
 */
export function reorderModuleLessonsRequest(
  courseId: number,
  moduleId: number,
  data: LessonOrderRequest,
  signal?: AbortSignal,
) {
  return apiClient.patch<ApiResponse<InstructorCourseResponse>>(
    `/${COURSE_BASE_V1}/${courseId}/modules/${moduleId}/lessons/order`,
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
