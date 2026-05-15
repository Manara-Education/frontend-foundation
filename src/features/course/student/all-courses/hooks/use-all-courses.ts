import { useCallback, useEffect, useMemo, useState } from "react";
import { allCoursesService } from "../services/all-courses.service";
import type { Course } from "../types/all-courses.types";

export function useAllCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");

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

  const filtered = useMemo(
    () =>
      courses.filter((c) =>
        c.title.toLowerCase().includes(query.toLowerCase())
      ),
    [courses, query]
  );

  const isFiltered = query.trim() !== "";

  const resetQuery = useCallback(() => setQuery(""), []);

  return {
    courses,
    filtered,
    isLoading,
    query,
    setQuery,
    isFiltered,
    resetQuery,
  };
}
