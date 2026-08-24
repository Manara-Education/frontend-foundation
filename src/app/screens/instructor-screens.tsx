import { Navigate, useNavigate, useParams } from "react-router";
import { AllCoursesPage } from "@/features/course/student/all-courses/pages/all-courses-page";
import { CreateCoursePage } from "@/features/course/Instructor/create-course/pages/create-course-page";
import { AddLessonsPage } from "@/features/lesson/instructor/add-lessons/pages/add-lessons-page";
import { InstructorHomePage } from "@/features/main/instructor/home/pages/home-page";
import { BannerFormPage } from "@/features/banner/instructor/banners/pages/banner-form-page";
import { BannersPage } from "@/features/banner/instructor/banners/pages/banners-page";
import {
  DEFAULT_COURSE_EDITOR_TAB,
  isCourseEditorTab,
  paths,
  type CourseEditorTab,
} from "@/shared/navigation";

/**
 * The instructor area's route adapters.
 *
 * Nested screens here — the course editor, the banner editor — are addresses of their own
 * rather than a mode the list drops into. That is what lets an instructor refresh mid-edit,
 * open a course in a second tab, and reach the same page from a link.
 */

/** `/instructor/home` — the dashboard. */
export function InstructorHomeScreen() {
  const navigate = useNavigate();

  return (
    <InstructorHomePage
      onCreateCourse={() => navigate(paths.instructor.createCourse)}
      onCourseClick={(courseId) => navigate(paths.instructor.courseEditor(courseId))}
    />
  );
}

/** `/instructor/courses` — every course this instructor owns. */
export function InstructorCoursesScreen() {
  const navigate = useNavigate();

  return (
    <AllCoursesPage
      onBack={() => navigate(paths.instructor.home)}
      onCreateCourse={() => navigate(paths.instructor.createCourse)}
      onCourseClick={(courseId) => navigate(paths.instructor.courseEditor(courseId))}
    />
  );
}

/**
 * `/instructor/courses/:courseId/:tab` — the course editor.
 *
 * The open tab is part of the address. It is a real section of the course, not a toggle:
 * an instructor sent to "pricing" by a failed publish, or sharing "content" with someone,
 * both need it to survive a reload.
 */
export function InstructorCourseEditorScreen() {
  const navigate = useNavigate();
  const { courseId, tab } = useParams();

  if (!courseId) return <Navigate to={paths.instructor.courses} replace />;
  if (!isCourseEditorTab(tab)) {
    return <Navigate to={paths.instructor.courseEditor(courseId)} replace />;
  }

  return (
    <AddLessonsPage
      courseId={courseId}
      activeTab={tab}
      onTabChange={(next: CourseEditorTab) =>
        navigate(paths.instructor.courseEditor(courseId, next))
      }
      /* "العودة" leads to the list this course belongs to, wherever it was opened from. */
      onFinish={() => navigate(paths.instructor.courses)}
    />
  );
}

/** `/instructor/courses/:courseId` — no tab named; settle on the default one. */
export function InstructorCourseEditorIndexRedirect() {
  const { courseId } = useParams();
  if (!courseId) return <Navigate to={paths.instructor.courses} replace />;
  return (
    <Navigate to={paths.instructor.courseEditor(courseId, DEFAULT_COURSE_EDITOR_TAB)} replace />
  );
}

/** `/instructor/create-course` — the new-course wizard. */
export function InstructorCreateCourseScreen() {
  const navigate = useNavigate();
  return <CreateCoursePage onCancel={() => navigate(paths.instructor.home)} />;
}

/** `/instructor/banners` — the banner list. */
export function InstructorBannersScreen() {
  const navigate = useNavigate();

  return (
    <BannersPage
      onCreateBanner={() => navigate(paths.instructor.newBanner)}
      onEditBanner={(bannerId) => navigate(paths.instructor.editBanner(bannerId))}
    />
  );
}

/** `/instructor/banners/new` — a blank banner. */
export function InstructorBannerCreateScreen() {
  const navigate = useNavigate();

  return (
    <BannerFormPage
      /*
        A saved banner is now a row in the list, so the editor's address is replaced rather
        than kept: Back leads to the list, not to the blank form that has just been used.
      */
      onSaved={() => navigate(paths.instructor.banners, { replace: true })}
      onCancel={() => navigate(paths.instructor.banners)}
    />
  );
}

/** `/instructor/banners/:bannerId` — an existing banner, loaded by id. */
export function InstructorBannerEditScreen() {
  const navigate = useNavigate();
  const { bannerId } = useParams();
  const id = Number(bannerId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return <Navigate to={paths.instructor.banners} replace />;
  }

  return (
    <BannerFormPage
      bannerId={id}
      onSaved={() => navigate(paths.instructor.banners, { replace: true })}
      onCancel={() => navigate(paths.instructor.banners)}
    />
  );
}
