import * as api from "../api/courses.api";
import { toCourseView } from "../mappers/courses.mapper";
import type { CourseView } from "../types/courses.types";

export const coursesService = {
  async loadCourses(): Promise<CourseView[]> {
    const { data } = await api.getMyCourses();
    return (data.data ?? []).map(toCourseView);
  },
};
