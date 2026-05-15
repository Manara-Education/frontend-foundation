import * as api from "../api/home.api";

export const homeService = {
  async getMyCourses() {
    const { data } = await api.getMyCourses();
    return data.data!;
  },
};
