import { useCallback, useEffect, useMemo, useState } from "react";
import type { CourseStatus } from "@/shared/courses";
import { allCoursesService } from "../services/all-courses.service";
import type {
  Course,
  CourseStatusCounts,
  CourseStatusFilter,
} from "../types/all-courses.types";

/** The view's segments in the wire enum's terms. `all` has no status to match against. */
const STATUS_BY_FILTER: Record<Exclude<CourseStatusFilter, "all">, CourseStatus> = {
  published: "PUBLISHED",
  draft: "DRAFT",
};

export function useAllCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CourseStatusFilter>("all");

  const fetchMyCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await allCoursesService.getMyCourses();
      setCourses(data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  /**
   * Counted over the whole collection, so the pills stay stable while the search runs —
   * a search that matches nothing must not make every segment read `0`.
   */
  const statusCounts = useMemo<CourseStatusCounts>(() => {
    const published = courses.filter((c) => c.status === "PUBLISHED").length;
    return {
      all: courses.length,
      published,
      draft: courses.length - published,
    };
  }, [courses]);

  const filtered = useMemo(
    () =>
      courses.filter((c) => {
        const matchesQuery = c.title.toLowerCase().includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || c.status === STATUS_BY_FILTER[statusFilter];
        return matchesQuery && matchesStatus;
      }),
    [courses, query, statusFilter]
  );

  const isFiltered = query.trim() !== "" || statusFilter !== "all";

  /** The empty state's escape hatch: back to the neutral "every course" view. */
  const resetFilters = useCallback(() => {
    setQuery("");
    setStatusFilter("all");
  }, []);

  return {
    courses,
    filtered,
    isLoading,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    statusCounts,
    isFiltered,
    resetFilters,
  };
}
