import * as api from "../api/instructor.api";

export const instructorService = {
  async getInstructorProfile(instructorId: number) {
    const { data } = await api.getInstructorProfile(instructorId);
    return data.data!;
  },

  async getInstructorCourses(instructorId: number) {
    const { data } = await api.getInstructorCourses(instructorId);
    return data.data!;
  }
};
