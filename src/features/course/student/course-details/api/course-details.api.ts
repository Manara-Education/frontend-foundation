import { apiClient, unwrap, type ApiResponse } from "@/shared/api";
import type { CheckoutRequest, CheckoutResponse } from "@/shared/courses";
import type {
  CourseDetailsApiResponse,
  CourseDetailsMode,
  CourseViewMode,
} from "../types/course-details.types";

const STUDENT_COURSE_BASE_V1 = "v1/student/courses";

const VIEW_MODE_MAP: Record<CourseDetailsMode, CourseViewMode> = {
  enrolled: "ENROLLED",
  browse: "DISCOVER",
};

export async function fetchCourseDetail(
  courseId: number,
  mode: CourseDetailsMode,
): Promise<CourseDetailsApiResponse> {
  const response = await apiClient.get<ApiResponse<CourseDetailsApiResponse>>(
    `/${STUDENT_COURSE_BASE_V1}/${courseId}`,
    { params: { mode: VIEW_MODE_MAP[mode] } },
  );
  return unwrap(response);
}

/**
 * The one call that grants access, whichever of the three ways the course is sold.
 *
 * The body carries an identifier and an instrument and nothing else the server acts on: no
 * price, no expiry, no access type. Which parts it reads is decided by the course.
 */
export async function processCheckout(
  courseId: number,
  request: CheckoutRequest,
): Promise<CheckoutResponse> {
  const response = await apiClient.post<ApiResponse<CheckoutResponse>>(
    `/${STUDENT_COURSE_BASE_V1}/${courseId}/checkout`,
    request,
  );
  return unwrap(response);
}
