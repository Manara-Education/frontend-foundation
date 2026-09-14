import { apiClient, type ApiResponse } from "@/shared/api";

const PUBLIC_COURSES_BASE_V1 = "v1/public/courses";

/**
 * The anonymous catalogue, one page at a time.
 *
 * No session is needed — the backend opens exactly these two `GET` routes to everyone — but the
 * request still goes through the shared client, so it gets the same-origin base URL, timeout and
 * error mapping as every other call. The payload is typed `unknown` on purpose: it is validated
 * by `public-courses.mapper.ts`, not trusted.
 */
export function getPublicCoursesRequest(params: { page: number; size: number }) {
  return apiClient.get<ApiResponse<unknown>>(PUBLIC_COURSES_BASE_V1, { params });
}

/** One course from the anonymous catalogue. */
export function getPublicCourseRequest(courseId: number) {
  return apiClient.get<ApiResponse<unknown>>(`${PUBLIC_COURSES_BASE_V1}/${courseId}`);
}
