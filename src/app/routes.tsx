import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { LandingPage } from "@/features/landing/pages/landing-page";
import { LoginPage } from "@/features/auth/login/pages/login-page";
import { RegisterPage } from "@/features/auth/register/pages/register-page";
import { ForgotPasswordPage } from "@/features/auth/forgot-password/pages/forgot-password-page";
import { OtpPage } from "@/features/auth/otp/pages/otp-page";
import { ResetPasswordPage } from "@/features/auth/reset-password/pages/reset-password-page";
import { ProfileView } from "@/features/profile/pages/profile-view";
import { AccessDeniedPage } from "@/features/session/access-denied/pages/access-denied-page";
import { ProtectedRoute, PublicOnlyRoute, RoleRoute, ROLES } from "@/shared/auth";
import {
  DocumentTitleProvider,
  paths,
  useRouteMeta,
  type RouteHandle,
} from "@/shared/navigation";
import { AppLayout } from "./layout/app-layout";
import { LegacyMainRedirect } from "./layout/legacy-main-redirect";
import { NotFoundPage } from "./layout/not-found-page";
import {
  StudentBrowseCourseScreen,
  StudentCourseDetailsScreen,
  StudentCoursesScreen,
  StudentExploreScreen,
  StudentLessonScreen,
} from "./screens/student-screens";
import {
  InstructorBannerCreateScreen,
  InstructorBannerEditScreen,
  InstructorBannersScreen,
  InstructorCourseEditorIndexRedirect,
  InstructorCourseEditorScreen,
  InstructorCoursesScreen,
  InstructorCreateCourseScreen,
  InstructorHomeScreen,
} from "./screens/instructor-screens";

/**
 * The application's route table.
 *
 * The hierarchy here *is* the navigation model. Reading downwards it says: everything sits
 * under the title updater; the public pages are ungated; the sign-in pages turn a signed-in
 * visitor away; and everything else is gated first on having a session and then on the role
 * that owns the area, before the shell and finally the screen itself.
 *
 * Every screen has an address. Nothing is a mode of something else, so a URL is enough to
 * reconstruct a page — which is what makes refresh, deep links and browser history work by
 * construction rather than by special-casing.
 *
 * `handle` is each route's own answer to "what is this page called, which primary section
 * owns it, and how wide does it want to be". The shell reads it; nothing inspects the URL
 * with string matching to find out.
 */

/** Small helper so route metadata is checked against the handle contract at the point of use. */
function handle(meta: RouteHandle): RouteHandle {
  return meta;
}

function TitleUpdater() {
  // The same route metadata the shell reads, so the tab and the page heading can never
  // disagree about what page this is. A screen that is standing in for its route — the
  // role guard's refusal — overrides it from underneath.
  const { title } = useRouteMeta();

  return (
    <DocumentTitleProvider title={title}>
      <Outlet />
    </DocumentTitleProvider>
  );
}

export const router = createBrowserRouter([
  {
    Component: TitleUpdater,
    children: [
      // ── PUBLIC ────────────────────────────────────────────────────────────
      // The landing page is the application's front door. It carries no guard:
      // a visitor sees it whether or not they are signed in, and it must not
      // wait on the session bootstrap before painting. It has no `handle` so
      // the tab reads plainly "منارة".
      {
        path: "/",
        Component: LandingPage,
      },

      // ── AUTHENTICATION ────────────────────────────────────────────────────
      {
        Component: PublicOnlyRoute,
        children: [
          {
            path: "login",
            Component: LoginPage,
            handle: handle({ title: "تسجيل الدخول" }),
          },
          {
            path: "register",
            Component: RegisterPage,
            handle: handle({ title: "إنشاء حساب" }),
          },
          {
            path: "forgot-password",
            Component: ForgotPasswordPage,
            handle: handle({ title: "نسيت كلمة المرور" }),
          },
        ],
      },

      // The one-time code screen is reached mid-sign-up and mid-reset, when the
      // visitor may be either signed in or not. It guards itself on the state it
      // was handed rather than on the session.
      {
        path: "otp",
        Component: OtpPage,
        handle: handle({ title: "التحقق من الرمز" }),
      },

      // Reset has two ways in: a verified one-time code, and a signed-in user
      // changing their own password from their profile. It therefore cannot sit
      // behind `PublicOnlyRoute` — that would turn the second one away — and it
      // checks for itself that it was reached legitimately.
      {
        path: "reset-password",
        Component: ResetPasswordPage,
        handle: handle({ title: "إعادة تعيين كلمة المرور" }),
      },

      // ── SIGNED IN ─────────────────────────────────────────────────────────
      {
        Component: ProtectedRoute,
        children: [
          // The address the whole signed-in app used to live at.
          { path: "main", Component: LegacyMainRedirect },

          {
            path: "access-denied",
            Component: AccessDeniedPage,
            handle: handle({ title: "وصول مرفوض" }),
          },

          // Shared by both roles: the profile screen is the same page for either.
          {
            Component: AppLayout,
            children: [
              {
                path: "profile",
                Component: ProfileView,
                handle: handle({
                  title: "ملفي الشخصي",
                  subtitle: "إدارة حسابك بسهولة",
                  section: "profile",
                }),
              },
            ],
          },

          // ── STUDENT ───────────────────────────────────────────────────────
          {
            path: "student",
            element: <RoleRoute allowedRoles={[ROLES.STUDENT, ROLES.ADMIN]} />,
            children: [
              { index: true, element: <Navigate to={paths.student.courses} replace /> },
              {
                Component: AppLayout,
                children: [
                  {
                    path: "courses",
                    Component: StudentCoursesScreen,
                    handle: handle({
                      title: "دوراتي",
                      subtitle: "متابعة مسيرتك التعليمية",
                      section: "student-courses",
                    }),
                  },
                  {
                    path: "courses/:courseId",
                    Component: StudentCourseDetailsScreen,
                    handle: handle({
                      title: "تفاصيل الدورة",
                      subtitle: "",
                      section: "student-courses",
                    }),
                  },
                  {
                    // The player lays its own content out in two columns beside the
                    // video, so it takes the shell's full width rather than the
                    // generic reading column.
                    path: "courses/:courseId/lessons/:lessonId",
                    Component: StudentLessonScreen,
                    handle: handle({
                      title: "الدرس",
                      subtitle: "",
                      section: "student-courses",
                      contentWidth: "full",
                    }),
                  },
                  {
                    path: "explore",
                    Component: StudentExploreScreen,
                    handle: handle({
                      title: "استكشاف الدورات",
                      subtitle: "اكتشف محتوى جديداً",
                      section: "student-explore",
                    }),
                  },
                  {
                    // The same course as `courses/:courseId`, reached from the
                    // catalogue instead. The address is what says so, which is how
                    // "استكشاف الدورات" stays lit and the breadcrumb reads right.
                    path: "explore/:courseId",
                    Component: StudentBrowseCourseScreen,
                    handle: handle({
                      title: "تفاصيل الدورة",
                      subtitle: "",
                      section: "student-explore",
                    }),
                  },
                ],
              },
            ],
          },

          // ── INSTRUCTOR ────────────────────────────────────────────────────
          {
            path: "instructor",
            element: <RoleRoute allowedRoles={[ROLES.INSTRUCTOR, ROLES.ADMIN]} />,
            children: [
              { index: true, element: <Navigate to={paths.instructor.home} replace /> },
              {
                Component: AppLayout,
                children: [
                  {
                    path: "home",
                    Component: InstructorHomeScreen,
                    handle: handle({
                      title: "لوحة المدرّب",
                      subtitle: "نظرة عامة على نشاطك التدريسي",
                      section: "instructor-home",
                    }),
                  },
                  {
                    path: "courses",
                    Component: InstructorCoursesScreen,
                    handle: handle({
                      title: "دوراتي",
                      subtitle: "إدارة كافة دوراتك التعليمية",
                      section: "instructor-courses",
                    }),
                  },
                  {
                    path: "courses/:courseId",
                    Component: InstructorCourseEditorIndexRedirect,
                    handle: handle({ section: "instructor-courses" }),
                  },
                  {
                    // The open tab is part of the address, but it identifies a
                    // section *within* the editor rather than a different page —
                    // hence `volatileParams`, which keeps switching tabs from
                    // replaying the shell's page transition.
                    path: "courses/:courseId/:tab",
                    Component: InstructorCourseEditorScreen,
                    handle: handle({
                      title: "محتوى الدورة",
                      subtitle: "إدارة الدروس والمحتوى",
                      section: "instructor-courses",
                      volatileParams: ["tab"],
                    }),
                  },
                  {
                    path: "create-course",
                    Component: InstructorCreateCourseScreen,
                    handle: handle({
                      title: "إنشاء دورة جديدة",
                      subtitle: "ابدأ بإعداد دورتك التالية",
                      section: "instructor-create",
                    }),
                  },
                  {
                    path: "banners",
                    Component: InstructorBannersScreen,
                    handle: handle({
                      title: "الإعلانات",
                      subtitle: "إدارة الإعلانات الترويجية",
                      section: "instructor-banners",
                      contentWidth: 960,
                    }),
                  },
                  {
                    path: "banners/new",
                    Component: InstructorBannerCreateScreen,
                    handle: handle({
                      title: "إعلان جديد",
                      subtitle: "إعداد إعلان ترويجي",
                      section: "instructor-banners",
                      contentWidth: 960,
                    }),
                  },
                  {
                    path: "banners/:bannerId",
                    Component: InstructorBannerEditScreen,
                    handle: handle({
                      title: "تعديل الإعلان",
                      subtitle: "تحديث الإعلان الترويجي",
                      section: "instructor-banners",
                      contentWidth: 960,
                    }),
                  },
                ],
              },
            ],
          },
        ],
      },

      // ── FALLBACK ──────────────────────────────────────────────────────────
      { path: "*", Component: NotFoundPage, handle: handle({ title: "الصفحة غير موجودة" }) },
    ],
  },
]);
