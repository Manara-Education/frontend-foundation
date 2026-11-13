import { PublicCourseContent } from "../components/public-course-content";
import { usePublicCourse } from "../hooks/use-public-courses";

/**
 * `/courses/:courseId` — one course, as anyone may see it.
 *
 * Readable without an account, on a direct link and after a refresh. It reads only the public
 * course endpoint: nothing from a learner's view of the course, no lessons and no media, is
 * requested here, signed in or not. Buying and enrolling happen after sign-in, on the student
 * course screen the price panel leads to.
 */
export function PublicCourseDetailPage({ courseId }: { courseId: string | undefined }) {
  const { state, retry } = usePublicCourse(courseId);
  return <PublicCourseContent state={state} onRetry={retry} />;
}
