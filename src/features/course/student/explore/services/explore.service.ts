import { unwrapList } from "@/shared/api";
import * as api from "../api/explore.api";
import { toExploreView } from "../mappers/explore.mapper";
import type { CourseExploreView } from "../types/explore.types";

export const exploreService = {
  async loadExploreCourses(): Promise<CourseExploreView[]> {
    const response = await api.getExploreCourses();
    return unwrapList(response).map(toExploreView);
  },
};
