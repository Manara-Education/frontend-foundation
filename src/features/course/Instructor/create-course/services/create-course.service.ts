import * as api from "../api/create-course.api";
import type { CourseRequest } from "../types/create-course.types";

export const createCourseService = {
  async createCourse(payload: CourseRequest) {
    const { data } = await api.createCourse(payload);
    return data.data!;
  },

  async uploadFile(file: File) {
    const { data } = await api.uploadFile(file);
    return data.data!.url;
  },
};
