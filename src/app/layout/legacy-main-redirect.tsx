import { Navigate, useSearchParams } from "react-router";
import { useAuth } from "@/shared/auth";
import {
  DEFAULT_COURSE_EDITOR_TAB,
  homePathForRole,
  paths,
} from "@/shared/navigation";

/**
 * `/main?view=…` — the address the whole signed-in application used to live at.
 *
 * Every screen was a query parameter on this one route, so any link that was ever shared,
 * bookmarked or left in a browser's history points here. This translates the old
 * parameters into the route that now owns that screen and replaces the history entry, so
 * the old address resolves to the right page instead of dying.
 */
export function LegacyMainRedirect() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const view = searchParams.get("view");
  const instructorCourseId = searchParams.get("instructorCourseId");
  const courseId = searchParams.get("courseId");
  const lessonId = searchParams.get("lessonId");
  const mode = searchParams.get("mode");

  return <Navigate to={legacyTarget()} replace />;

  function legacyTarget(): string {
    if (instructorCourseId) {
      return paths.instructor.courseEditor(instructorCourseId, DEFAULT_COURSE_EDITOR_TAB);
    }
    if (courseId && lessonId) return paths.student.lesson(courseId, lessonId);
    if (courseId) {
      return mode === "browse"
        ? paths.student.exploreCourse(courseId)
        : paths.student.courseDetails(courseId);
    }

    switch (view) {
      case "home":
        return paths.student.courses;
      case "explore":
        return paths.student.explore;
      case "profile":
        return paths.profile;
      case "instructor-home":
        return paths.instructor.home;
      case "instructor-courses":
        return paths.instructor.courses;
      case "instructor-create":
        return paths.instructor.createCourse;
      case "instructor-banners":
        return paths.instructor.banners;
      default:
        return homePathForRole(user?.role);
    }
  }
}
