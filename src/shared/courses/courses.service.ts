import { getMyCoursesRequest } from "./courses.api";
import type { Course } from "./courses.types";

export async function getMyCourses(): Promise<Course[]> {
  const { data } = await getMyCoursesRequest();
  return data.data ?? [];
}
