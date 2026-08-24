import type { CheckoutResponse, PaymentMethodRequest } from "@/shared/courses";
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

/** A free course takes an empty body — no instrument, no plan, nothing to send. */
export function enrollFree(courseId: number): Promise<CheckoutResponse> {
  return api.processCheckout(courseId, {});
}

/** The amount is the course's stored price; this only supplies the instrument. */
export function purchaseCourse(
  courseId: number,
  paymentMethod: PaymentMethodRequest,
): Promise<CheckoutResponse> {
  return api.processCheckout(courseId, { paymentMethod });
}

/**
 * Subscribing and renewing are the same call: the plan's identifier plus an instrument. The
 * price and the new expiry are read from the plan by the backend, so nothing about the
 * window is decided here.
 */
export function subscribeToCourse(
  courseId: number,
  planId: number,
  paymentMethod: PaymentMethodRequest,
): Promise<CheckoutResponse> {
  return api.processCheckout(courseId, { planId, paymentMethod });
}
