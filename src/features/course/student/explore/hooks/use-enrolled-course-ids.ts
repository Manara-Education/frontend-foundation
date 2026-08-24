import { useEffect, useState } from "react";
import { coursesService } from "@/features/course/student/courses/services/courses.service";

/**
 * The ids of the courses the learner already holds.
 *
 * The catalogue needs them for two things: to leave those courses out of what it offers,
 * and to send a click on one to the learner's own copy rather than to the sales page. It
 * is read here, where it is used, rather than by the shell for every screen.
 */
export function useEnrolledCourseIds(): Set<number> {
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    coursesService
      .loadCourses()
      .then((courses) => {
        if (!cancelled) setEnrolledIds(new Set(courses.map((c) => c.id)));
      })
      .catch((err) => console.error("Failed to load enrolled courses cache", err));
    return () => {
      cancelled = true;
    };
  }, []);

  return enrolledIds;
}
