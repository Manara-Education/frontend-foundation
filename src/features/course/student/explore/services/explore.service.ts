import * as api from "../api/explore.api";
import { toExploreView } from "../mappers/explore.mapper";
import type { CourseExploreView } from "../types/explore.types";

export const exploreService = {
  async loadExploreCourses(): Promise<CourseExploreView[]> {
    const { data } = await api.getExploreCourses();
    return (data.data ?? []).map(toExploreView);
  },
};
