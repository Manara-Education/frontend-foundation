import { unwrap } from "@/shared/api";
import type { CourseRequest } from "@/shared/courses";
import * as api from "../api/create-course.api";

export const createCourseService = {
  async createCourse(payload: CourseRequest) {
    return unwrap(await api.createCourse(payload));
  },

  async uploadFile(file: File) {
    return unwrap(await api.uploadFile(file)).url;
  },
};
