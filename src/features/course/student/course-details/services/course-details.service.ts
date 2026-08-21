import type { CheckoutRequest } from "@/shared/courses";
import * as api from "../api/course-details.api";
import { mapCourseDetailsResponseToStudentCourseModel } from "../mappers/course-details.mapper";
import type { CourseDetailsMode, StudentCourseModel } from "../types/course-details.types";

export async function loadCourseDetail(
  courseId: number,
  mode: CourseDetailsMode,
): Promise<StudentCourseModel> {
  const dto = await api.fetchCourseDetail(courseId, mode);
  return mapCourseDetailsResponseToStudentCourseModel(dto);
}

export async function processCheckout(
  courseId: number,
  paymentDetails?: CheckoutRequest,
): Promise<void> {
  await api.processCheckout(courseId, paymentDetails);
}
