import { useEffect, useMemo, useState } from "react";
import { coursesService } from "../services/courses.service";
import type { CourseView, FilterKey } from "../types/courses.types";

interface UseCoursesViewOptions {
  onCourseClick?: (id: number) => void;
}

export function useCoursesView({ onCourseClick }: UseCoursesViewOptions = {}) {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<CourseView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const data = await coursesService.loadCourses();
        if (!cancelled) setCourses(data);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load courses", err);
          setError("تعذر تحميل الدورات");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = courses.length;
  const completed = useMemo(() => courses.filter((c) => c.status === "completed").length, [courses]);
  const inProgress = useMemo(() => courses.filter((c) => c.status === "in-progress").length, [courses]);

  const filtered = useMemo(() => {
    let list = courses;
    if (activeFilter !== "all") list = list.filter((c) => c.status === activeFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [courses, activeFilter, query]);

  function handleQueryChange(value: string) {
    setQuery(value);
  }

  function handleFilterChange(key: FilterKey) {
    setActiveFilter(key);
  }

  function handleCourseClick(id: number) {
    onCourseClick?.(id);
  }

  return {
    isLoading,
    error,
    query,
    activeFilter,
    filtered,
    total,
    completed,
    inProgress,
    onQueryChange: handleQueryChange,
    onFilterChange: handleFilterChange,
    onCourseClick: handleCourseClick,
  };
}

export type UseCoursesViewReturn = ReturnType<typeof useCoursesView>;
