import * as api from "../api/all-courses.api";

export const allCoursesService = {
  async getMyCourses() {
    const { data } = await api.getMyCourses();
    return data.data!;
  },
};
