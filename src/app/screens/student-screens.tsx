import { Navigate, useNavigate, useParams } from "react-router";
import { CoursesPage } from "@/features/course/student/courses/pages/courses-page";
import { CourseDetailsPage } from "@/features/course/student/course-details/pages/course-details-page";
import { ExplorePage } from "@/features/course/student/explore/pages/explore-page";
import { useEnrolledCourseIds } from "@/features/course/student/explore/hooks/use-enrolled-course-ids";
import { LessonPage } from "@/features/lesson/student/lesson-details/pages/lesson-page";
import { paths } from "@/shared/navigation";

/**
 * The student area's route adapters.
 *
 * Each one reads its identity from the URL and hands the feature page the destinations its
 * callbacks stand for. The feature pages stay presentational and know nothing about
 * routing; what changed is that "open this course" is now an address rather than a state
 * update, so it survives a refresh and answers to Back.
 */

function useNumericParam(name: string): number | null {
  const params = useParams();
  const raw = params[name];
  if (!raw) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

/** `/student/courses` — the learner's own courses, and their home. */
export function StudentCoursesScreen() {
  const navigate = useNavigate();

  return (
    <CoursesPage
      onBrowse={() => navigate(paths.student.explore)}
      onCourseClick={(id) => navigate(paths.student.courseDetails(id))}
    />
  );
}

/** `/student/courses/:courseId` — a course the learner already holds. */
export function StudentCourseDetailsScreen() {
  const navigate = useNavigate();
  const courseId = useNumericParam("courseId");

  if (courseId === null) return <Navigate to={paths.student.courses} replace />;

  return (
    <CourseDetailsPage
      courseId={courseId}
      mode="enrolled"
      onHome={() => navigate(paths.student.courses)}
      onBack={() => navigate(paths.student.courses)}
      onLessonClick={(lessonId) => navigate(paths.student.lesson(courseId, lessonId))}
    />
  );
}

/** `/student/courses/:courseId/lessons/:lessonId` — the lesson player. */
export function StudentLessonScreen() {
  const navigate = useNavigate();
  const courseId = useNumericParam("courseId");
  const lessonId = useNumericParam("lessonId");

  if (courseId === null) return <Navigate to={paths.student.courses} replace />;
  if (lessonId === null) return <Navigate to={paths.student.courseDetails(courseId)} replace />;

  return (
    <LessonPage
      courseId={courseId}
      lessonId={lessonId}
      onBackToCourseDetails={() => navigate(paths.student.courseDetails(courseId))}
      onBackToCourses={() => navigate(paths.student.courses)}
      onBackToHome={() => navigate(paths.student.courses)}
      onLessonChange={(id) => navigate(paths.student.lesson(courseId, id))}
    />
  );
}

/** `/student/explore` — the catalogue. */
export function StudentExploreScreen() {
  const navigate = useNavigate();
  const enrolledCourseIds = useEnrolledCourseIds();

  return (
    <ExplorePage
      enrolledCourseIds={enrolledCourseIds}
      onGoHome={() => navigate(paths.student.courses)}
      onCourseClick={(id) =>
        navigate(
          enrolledCourseIds.has(id)
            ? paths.student.courseDetails(id)
            : paths.student.exploreCourse(id),
        )
      }
    />
  );
}

/**
 * `/student/explore/:courseId` — a catalogue course, shown in "browse" mode.
 *
 * The same course has two addresses on purpose: which one is open says where the learner
 * came from, which is what keeps the right sidebar entry lit and the breadcrumb honest.
 */
export function StudentBrowseCourseScreen() {
  const navigate = useNavigate();
  const courseId = useNumericParam("courseId");

  if (courseId === null) return <Navigate to={paths.student.explore} replace />;

  return (
    <CourseDetailsPage
      courseId={courseId}
      mode="browse"
      onHome={() => navigate(paths.student.courses)}
      onBack={() => navigate(paths.student.explore)}
      onLessonClick={(lessonId) => navigate(paths.student.lesson(courseId, lessonId))}
      /*
        Enrolling moves the course out of the catalogue and into the learner's own list, so
        the catalogue address it was reached at is replaced rather than pushed: Back should
        not lead to a "buy this" page for a course that has just been bought.
      */
      onEnrolled={() => navigate(paths.student.courseDetails(courseId), { replace: true })}
    />
  );
}
