import { unwrapList } from "@/shared/api";
import { getMyCoursesRequest } from "./courses.api";
import { mapCourseResponseToCourseCardModel } from "./courses.mappers";
import type { CourseCardModel } from "./courses.models";

export async function getMyCourses(): Promise<CourseCardModel[]> {
  const response = await getMyCoursesRequest();
  return unwrapList(response).map(mapCourseResponseToCourseCardModel);
}
