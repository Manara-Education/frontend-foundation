import { useCallback } from "react";
import { useNavigate } from "react-router";
import { usePublicCourses } from "@/features/public-courses/hooks/use-public-courses";
import { PUBLIC_COURSES_PAGE_SIZE } from "@/features/public-courses/services/public-courses.service";
import { paths } from "@/shared/navigation";

/**
 * Navigation for the landing page's call-to-action buttons, and the real courses its courses
 * section shows. Every destination is a real application route — the reference prototype used
 * raw `window.location.href` assignments instead.
 *
 * The courses are the first page of the public catalogue (newest first). The page paints at
 * once; the section shows its own loading, empty and failure states while they arrive.
 */
export function useLanding() {
  const navigate = useNavigate();

  const onRegister = useCallback(() => navigate(paths.register), [navigate]);
  const onSignIn = useCallback(() => navigate(paths.login), [navigate]);
  const { state: courses, retry: onRetryCourses } = usePublicCourses(0, PUBLIC_COURSES_PAGE_SIZE);

  return { onRegister, onSignIn, courses, onRetryCourses };
}
