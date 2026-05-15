import { useCallback, useEffect, useMemo, useState } from "react";
import { homeService } from "../services/home.service";
import type { Course } from "../types/home.types";
import { useAuth } from "@/shared/auth";

export function useHome() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await homeService.getMyCourses();
      setCourses(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const firstName = useMemo(
    () => user?.fullName?.split(" ")[0] || "المدرّب",
    [user?.fullName]
  );

  const hasCourses = courses.length > 0;

  const totalEnrolled = useMemo(
    () => courses.reduce((acc, course) => acc + (course.studentsCount || 0), 0),
    [courses]
  );

  return {
    courses,
    isLoading,
    hasCourses,
    totalEnrolled,
    firstName,
  };
}
