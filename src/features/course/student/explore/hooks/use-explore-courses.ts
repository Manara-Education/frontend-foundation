import { useEffect, useState, useMemo, useCallback } from "react";
import { exploreService } from "../services/explore.service";
import type { CourseExploreView } from "../types/explore.types";

export function useExploreCourses() {
  const [courses, setCourses] = useState<CourseExploreView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await exploreService.loadExploreCourses();
      setCourses(data);
    } catch (err) {
      console.error("Failed to load explore courses", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filtered = useMemo(() => {
    if (!query.trim()) return courses;
    const q = query.trim().toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q)
    );
  }, [courses, query]);

  const isFiltered = query.trim() !== "";

  return {
    courses,
    filtered,
    isLoading,
    query,
    setQuery,
    isFiltered,
    resetQuery: () => setQuery(""),
  };
}
