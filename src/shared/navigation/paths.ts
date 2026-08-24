import { isInstructorRole } from "@/shared/auth/roles";

/**
 * Every URL the application can navigate to, in one place.
 *
 * Screens build destinations from here instead of writing path strings inline, so a route
 * that moves is renamed once and the compiler finds every caller. The dynamic segments are
 * functions for the same reason — `paths.student.lesson(4, 12)` cannot drift out of step
 * with the `:courseId`/`:lessonId` pattern the router is matching against.
 */

export const COURSE_EDITOR_TABS = ["overview", "content", "quizzes", "pricing"] as const;
export type CourseEditorTab = (typeof COURSE_EDITOR_TABS)[number];

export const DEFAULT_COURSE_EDITOR_TAB: CourseEditorTab = "content";

export function isCourseEditorTab(value: string | undefined): value is CourseEditorTab {
  return !!value && (COURSE_EDITOR_TABS as readonly string[]).includes(value);
}

export const paths = {
  landing: "/",

  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  otp: "/otp",

  /** Shared by both roles — the profile screen is the same page for either of them. */
  profile: "/profile",
  accessDenied: "/access-denied",

  student: {
    root: "/student",
    /** The learner's own courses. This is also the student's home. */
    courses: "/student/courses",
    courseDetails: (courseId: number | string) => `/student/courses/${courseId}`,
    lesson: (courseId: number | string, lessonId: number | string) =>
      `/student/courses/${courseId}/lessons/${lessonId}`,
    /** The catalogue. A course opened from here is shown in "browse" mode. */
    explore: "/student/explore",
    exploreCourse: (courseId: number | string) => `/student/explore/${courseId}`,
  },

  instructor: {
    root: "/instructor",
    home: "/instructor/home",
    courses: "/instructor/courses",
    courseEditor: (
      courseId: number | string,
      tab: CourseEditorTab = DEFAULT_COURSE_EDITOR_TAB,
    ) => `/instructor/courses/${courseId}/${tab}`,
    createCourse: "/instructor/create-course",
    banners: "/instructor/banners",
    newBanner: "/instructor/banners/new",
    editBanner: (bannerId: number | string) => `/instructor/banners/${bannerId}`,
  },
} as const;

/**
 * The primary navigation entries. A route names its owner in `handle.section`, which is
 * what keeps the sidebar highlight correct on nested pages without any path sniffing.
 */
export type NavSectionId =
  | "student-courses"
  | "student-explore"
  | "instructor-home"
  | "instructor-courses"
  | "instructor-create"
  | "instructor-banners"
  | "profile";

/** Where a signed-in user belongs when no more specific destination is known. */
export function homePathForRole(role: string | null | undefined): string {
  return isInstructorRole(role) ? paths.instructor.root : paths.student.root;
}

/** The role-owned areas. `/profile` is deliberately absent: either role may open it. */
const ROLE_AREAS: ReadonlyArray<{ prefix: string; instructorOnly: boolean }> = [
  { prefix: paths.instructor.root, instructorOnly: true },
  { prefix: paths.student.root, instructorOnly: false },
];

function isWithin(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Whether a role may open a path at all.
 *
 * Used to sanity-check a remembered post-login destination. Sending an instructor to the
 * `/student/...` page they were bounced off of would only land them on "access denied",
 * so the caller falls back to their own home instead.
 */
export function canRoleOpen(role: string | null | undefined, pathname: string): boolean {
  const area = ROLE_AREAS.find((candidate) => isWithin(pathname, candidate.prefix));
  if (!area) return true;
  return area.instructorOnly === isInstructorRole(role);
}

/**
 * The destination after a successful sign-in.
 *
 * `from` is the protected URL the guard turned away, carried through the login screen in
 * history state. It is honoured when the role can actually open it, so a deep link
 * survives the detour through authentication.
 */
export function resolvePostLoginPath(
  role: string | null | undefined,
  from: string | null | undefined,
): string {
  if (from && from.startsWith("/") && !from.startsWith("//")) {
    if (isWithin(from, paths.login) || isWithin(from, paths.register)) return homePathForRole(role);
    if (canRoleOpen(role, from)) return from;
  }
  return homePathForRole(role);
}
