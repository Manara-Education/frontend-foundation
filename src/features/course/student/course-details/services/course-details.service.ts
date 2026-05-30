import * as api from "../api/course-details.api";
import { toCourseDetail } from "../mappers/course-details.mapper";
import type { CourseDetailData, CourseDetailsMode } from "../types/course-details.types";

export async function loadCourseDetail(
  courseId: number,
  mode: CourseDetailsMode,
): Promise<CourseDetailData> {
  const dto = await api.fetchCourseDetail(courseId, mode);
  return toCourseDetail(dto);
}

export function getBrowsePrice(courseId: number): number | null {
  return api.fetchBrowsePrice(courseId);
}

export async function processCheckout(courseId: number, isFree: boolean): Promise<void> {
  await api.processCheckout(courseId, isFree);
}
