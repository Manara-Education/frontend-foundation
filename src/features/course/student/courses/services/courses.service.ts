import { unwrapList } from "@/shared/api";
import * as api from "../api/courses.api";
import { toCourseView } from "../mappers/courses.mapper";
import type { CourseView } from "../types/courses.types";

export const coursesService = {
  async loadCourses(): Promise<CourseView[]> {
    const response = await api.getMyCourses();
    return unwrapList(response).map(toCourseView);
  },
};
