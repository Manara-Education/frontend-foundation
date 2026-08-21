import { useEffect, useState } from "react";
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

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
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
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, mode]);

  const browsePrice = mode === "browse" && courseData ? courseData.price : null;

  function handleEnrolled() {
    onEnrolled?.();
  }

  return { isLoading, courseData, browsePrice, mode, error, handleEnrolled };
}
