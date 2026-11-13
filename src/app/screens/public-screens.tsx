import { useParams } from "react-router";
import { PublicCourseDetailPage } from "@/features/public-courses/pages/public-course-detail-page";

/**
 * The public area's route adapters.
 *
 * `/courses/:courseId` — a course's public page. The raw segment is handed over as typed: the
 * feature decides whether it is a course id at all, and answers a mangled one exactly like a
 * course that is not on offer.
 */
export function PublicCourseScreen() {
  const { courseId } = useParams();
  return <PublicCourseDetailPage courseId={courseId} />;
}
