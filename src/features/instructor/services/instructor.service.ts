import { unwrap, unwrapList } from "@/shared/api";
import * as api from "../api/instructor.api";

export const instructorService = {
  async getInstructorProfile(instructorId: number) {
    return unwrap(await api.getInstructorProfile(instructorId));
  },

  async getInstructorCourses(instructorId: number) {
    return unwrapList(await api.getInstructorCourses(instructorId));
  },
};
