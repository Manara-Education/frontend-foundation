import { useEffect, useState, type ElementType } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Compass } from "lucide-react";
import { Sidebar, isInstructorRole, type ActiveView } from "@/features/main/components/sidebar.tsx";
import { CoursesPage } from "@/features/course/student/courses/pages/courses-page";
import { CourseDetailsPage } from "@/features/course/student/course-details/pages/course-details-page";
import { LessonPage } from "@/features/lesson/student/lesson-details/pages/lesson-page";
import { InstructorHomePage } from "@/features/main/instructor/home/pages/home-page.tsx";
import { AllCoursesPage } from "@/features/course/student/all-courses/pages/all-courses-page";
import { CreateCoursePage } from "@/features/course/Instructor/create-course/pages/create-course-page";
import { AddLessonsPage } from "@/features/lesson/instructor/add-lessons/pages/add-lessons-page";
import { ProfileView } from "@/features/profile/pages/profile-view.tsx";
import { useAuth } from "@/shared/auth";
import { ExplorePage } from "@/features/course/student/explore/pages/explore-page";
import { coursesService } from "@/features/course/student/courses/services/courses.service";
import type { CourseDetailsMode } from "@/features/course/student/course-details/types/course-details.types";

const PRIMARY = "#4E5B92";

// ── Placeholder view (Courses / Explore) ──────────────────────────────────────

function PlaceholderView({ icon: Icon, title, subtitle, color }: { icon: ElementType; title: string; subtitle: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full min-h-96 gap-5"
      dir="rtl"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      <div className="flex items-center justify-center rounded-3xl" style={{ width: 80, height: 80, background: `${color}14` }}>
        <Icon size={36} style={{ color }} />
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h2 style={{ fontWeight: 700, fontSize: 22, color: "#1E2340" }}>{title}</h2>
        <p style={{ fontSize: 14, color: "#9BA3C4", maxWidth: 280, lineHeight: 1.7 }}>{subtitle}</p>
      </div>
      <div
        className="flex items-center gap-2 rounded-2xl px-5 py-2.5"
        style={{ background: `${color}12`, border: `1.5px solid ${color}22`, color, fontWeight: 600, fontSize: 13, cursor: "default" }}
      >
        قريباً
      </div>
    </motion.div>
  );
}

// ── Section titles ─────────────────────────────────────────────────────────────

const VIEW_META: Record<ActiveView, { title: string; subtitle: string }> = {
  home:                 { title: "دوراتي",             subtitle: "متابعة مسيرتك التعليمية" },
  explore:              { title: "استكشاف الدورات",    subtitle: "اكتشف محتوى جديداً" },
  profile:              { title: "ملفي الشخصي",        subtitle: "إدارة حسابك بسهولة" },
  "instructor-home":    { title: "لوحة المدرّب",        subtitle: "نظرة عامة على نشاطك التدريسي" },
  "instructor-courses": { title: "كل دوراتي",           subtitle: "أدر وعدّل جميع دوراتك" },
  "instructor-create":  { title: "إنشاء دورة جديدة",    subtitle: "ابدأ بإعداد دورتك التالية" },
};

// ── MainPage ──────────────────────────────────────────────────────────────────

export function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInstructor = isInstructorRole(user?.role);
  const defaultView: ActiveView = isInstructor ? "instructor-home" : "home";
  const initialView = (searchParams.get("view") as ActiveView) ?? (location.state as { view?: ActiveView } | null)?.view ?? defaultView;
  const [activeView, setActiveView] = useState<ActiveView>(initialView);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  const courseIdParam = searchParams.get("courseId");
  const studentCourseId = courseIdParam ? Number(courseIdParam) : null;
  const lessonIdParam = searchParams.get("lessonId");
  const studentLessonId = lessonIdParam ? Number(lessonIdParam) : null;

  const modeParam = searchParams.get("mode") as CourseDetailsMode | null;
  const detailsMode = modeParam ?? "enrolled";

  function setStudentCourseId(id: number | null, mode: CourseDetailsMode = "enrolled") {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id === null) {
          next.delete("courseId");
          next.delete("mode");
        } else {
          next.set("courseId", String(id));
          next.set("mode", mode);
        }
        next.delete("lessonId");
        return next;
      },
      { replace: false },
    );
  }

  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user?.role?.toLowerCase() === "student") {
      coursesService.loadCourses()
        .then((courses) => {
          setEnrolledIds(new Set(courses.map((c) => c.id)));
        })
        .catch((err) => console.error("Failed to load enrolled courses cache", err));
    }
  }, [user]);

  function setStudentLessonId(id: number | null) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id === null) next.delete("lessonId");
        else next.set("lessonId", String(id));
        return next;
      },
      { replace: false },
    );
  }

  useEffect(() => {
    if (studentCourseId !== null && activeCourseId !== null) {
      setActiveCourseId(null);
    }
  }, [studentCourseId, activeCourseId]);

  const showLessons = activeCourseId !== null;
  const showStudentLesson = studentCourseId !== null && studentLessonId !== null;
  const showStudentCourseDetails = studentCourseId !== null && !showStudentLesson;
  const meta = showLessons
    ? { title: "محتوى الدورة", subtitle: "إدارة الدروس والمحتوى" }
    : showStudentLesson
    ? { title: "الدرس", subtitle: "" }
    : showStudentCourseDetails
    ? { title: "تفاصيل الدورة", subtitle: "" }
    : VIEW_META[activeView];

  const goTo = (view: ActiveView) => {
    setActiveCourseId(null);
    setStudentCourseId(null);
    setActiveView(view);
  };

  return (
    <div
      dir="ltr"
      style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Cairo', sans-serif", background: "#F2F3F9" }}
    >
      {/* ── MAIN CONTENT (Left) ───────────────────────────────────────────── */}
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ minWidth: 0 }}
      >
        {/* Sticky top bar */}
        <header
          className="flex-shrink-0 flex items-center px-8"
          dir="rtl"
          style={{
            height: 64,
            background: "rgba(242,243,249,0.9)",
            backdropFilter: "blur(16px)",
            borderBottomWidth: 1,
            borderBottomStyle: "solid",
            borderBottomColor: "rgba(78,91,146,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-0.5"
            >
              <h1 style={{ fontWeight: 700, fontSize: 18, color: "#1E2340", lineHeight: 1.2 }}>
                {meta.title}
              </h1>
              <p style={{ fontSize: 12, color: "#9BA3C4" }}>{meta.subtitle}</p>
            </motion.div>
          </AnimatePresence>
        </header>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto"
          dir="rtl"
          style={{
            backgroundImage:
              "radial-gradient(circle at 90% 5%, rgba(78,91,146,0.04) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(78,91,146,0.03) 0%, transparent 45%)",
          }}
        >
          {/* Constrained content width — centred in the available space */}
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 32px 80px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={showLessons ? `lessons:${activeCourseId}` : showStudentLesson ? `lesson:${studentCourseId}:${studentLessonId}` : showStudentCourseDetails ? `course:${studentCourseId}` : activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {showLessons ? (
                  <AddLessonsPage
                    courseId={activeCourseId!}
                    onFinish={() => goTo("instructor-home")}
                  />
                ) : showStudentLesson ? (
                  <LessonPage
                    courseId={studentCourseId!}
                    lessonId={studentLessonId!}
                    onBackToCourseDetails={() => setStudentLessonId(null)}
                    onBackToCourses={() => {
                      setStudentCourseId(null);
                      goTo("home");
                    }}
                    onBackToHome={() => goTo("home")}
                    onLessonChange={(id) => setStudentLessonId(id)}
                  />
                ) : showStudentCourseDetails ? (
                  <CourseDetailsPage
                    courseId={studentCourseId!}
                    mode={detailsMode}
                    onBack={() => setStudentCourseId(null)}
                    onLessonClick={(lessonId) => setStudentLessonId(lessonId)}
                    onEnrolled={() => {
                      setEnrolledIds((prev) => {
                        const next = new Set(prev);
                        next.add(studentCourseId!);
                        return next;
                      });
                      setActiveView("home");
                      setStudentCourseId(studentCourseId!, "enrolled");
                    }}
                  />
                ) : (
                  <>
                    {activeView === "home" && (
                      <CoursesPage
                        onBrowse={() => goTo("explore")}
                        onCourseClick={(id) => setStudentCourseId(id, "enrolled")}
                      />
                    )}

                    {activeView === "explore" && (
                      <ExplorePage
                        enrolledCourseIds={enrolledIds}
                        onCourseClick={(id) => {
                          const isEnrolled = enrolledIds.has(id);
                          setStudentCourseId(id, isEnrolled ? "enrolled" : "browse");
                        }}
                      />
                    )}

                    {activeView === "profile" && <ProfileView />}

                    {activeView === "instructor-home" && (
                      <InstructorHomePage
                        onCreateCourse={() => goTo("instructor-create")}
                        onViewAllCourses={() => goTo("instructor-courses")}
                        onCourseClick={(courseId) => setActiveCourseId(courseId)}
                      />
                    )}

                    {activeView === "instructor-courses" && (
                      <AllCoursesPage
                        onBack={() => goTo("instructor-home")}
                        onCreateCourse={() => goTo("instructor-create")}
                        onCourseClick={(courseId) => setActiveCourseId(courseId)}
                      />
                    )}

                    {activeView === "instructor-create" && (
                      <CreateCoursePage
                        onCancel={() => goTo("instructor-home")}
                        onCourseCreated={(courseId) => setActiveCourseId(courseId)}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ── SIDEBAR (Right) ───────────────────────────────────────────────── */}
      <Sidebar
        activeView={activeView}
        onNavigate={goTo}
        role={user?.role}
        fullName={user?.fullName}
        onLogout={async () => {
          await logout();
          navigate("/", { replace: true });
        }}
      />
    </div>
  );
}
