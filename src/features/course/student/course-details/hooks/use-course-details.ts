import { useEffect, useState } from "react";
import { courseDetailsService } from "../services/course-details.service";
import type { CourseDetailData } from "../types/course-details.types";

export function useCourseDetails(courseId: number) {
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseDetailData | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const data = await courseDetailsService.loadCourseDetail(courseId);
        if (!cancelled) setCourseData(data);
      } catch (err) {
        console.error("Failed to load course details", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [courseId]);

  return { isLoading, courseData };
}
