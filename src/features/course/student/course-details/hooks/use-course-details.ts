import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/api";
import { loadCourseDetail } from "../services/course-details.service";
import type { CourseDetailData, CourseDetailsMode } from "../types/course-details.types";

interface UseCourseDetailsArgs {
  courseId: number;
  mode: CourseDetailsMode;
  onEnrolled?: () => void;
}

export function useCourseDetails({ courseId, mode, onEnrolled }: UseCourseDetailsArgs) {
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Only the first load of a course shows the skeleton; a progression refresh keeps
    // the page on screen and swaps the curriculum underneath it.
    const isFirstLoad = reloadToken === 0;
    if (isFirstLoad) setIsLoading(true);
    setError(null);
    loadCourseDetail(courseId, mode)
      .then((data) => {
        if (!cancelled) setCourseData(data);
      })
      .catch((err) => {
        console.error("Failed to load course details", err);
        if (cancelled) return;
        if (err instanceof ApiError) {
          setError(`${err.statusCode}: ${err.errors.join(", ") || err.message}`);
        } else {
          setError(err?.message ?? "Unknown error");
        }
      })
      .finally(() => {
        if (!cancelled && isFirstLoad) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, mode, reloadToken]);

  useEffect(() => {
    setReloadToken(0);
  }, [courseId, mode]);

  /**
   * Re-reads the course after an exam moved the learner along. What unlocked, what the
   * progress now is and which lesson comes next are all the server's answers — this
   * asks for them again rather than applying the rules locally.
   */
  const refreshProgression = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  function handleEnrolled() {
    onEnrolled?.();
  }

  return {
    isLoading,
    courseData,
    mode,
    error,
    handleEnrolled,
    refreshProgression,
  };
}
