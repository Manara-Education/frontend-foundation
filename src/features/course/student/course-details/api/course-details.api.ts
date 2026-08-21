import { apiClient, unwrap, type ApiResponse } from "@/shared/api";
import type { CheckoutRequest, EnrollmentResponse } from "@/shared/courses";
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

export async function processCheckout(
  courseId: number,
  paymentDetails?: CheckoutRequest,
): Promise<void> {
  await apiClient.post<ApiResponse<EnrollmentResponse>>(
    `/${STUDENT_COURSE_BASE_V1}/${courseId}/checkout`,
    paymentDetails ?? {},
  );
}
