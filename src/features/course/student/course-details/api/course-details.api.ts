import { apiClient, type ApiResponse } from "@/shared/api";
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
  const { data } = await apiClient.get<ApiResponse<CourseDetailsApiResponse>>(
    `/${STUDENT_COURSE_BASE_V1}/${courseId}`,
    { params: { mode: VIEW_MODE_MAP[mode] } },
  );
  return data.data!;
}

// TODO: connect to real API — pricing endpoint for browse mode
export function fetchBrowsePrice(_courseId: number): number | null {
  return null;
}

// TODO: connect to real Stripe checkout flow
export async function processCheckout(_courseId: number, _isFree: boolean): Promise<void> {
  throw new Error("processCheckout is not implemented");
}
