import { useState, type ElementType } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Compass } from "lucide-react";
import { Sidebar, isInstructorRole, type ActiveView } from "@/features/main/components/sidebar.tsx";
import { HomePage } from "@/features/main/student/home/pages/home-page";
import { InstructorHomeView } from "@/features/main/components/instructor-home-view.tsx";
import { AllCoursesPage } from "@/features/course/student/all-courses/pages/all-courses-page";
import { CreateCoursePage } from "@/features/course/Instructor/create-course/pages/create-course-page";
import { AddLessonsPage } from "@/features/course/Instructor/add-lessons/pages/add-lessons-page";
import { ProfileView } from "@/features/profile/pages/profile-view.tsx";
import { useAuth } from "@/shared/auth";

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
  home:                 { title: "الرئيسية",          subtitle: "مرحباً بك في منارة" },
  courses:              { title: "دوراتي",             subtitle: "متابعة مسيرتك التعليمية" },
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
  const [searchParams] = useSearchParams();
  const isInstructor = isInstructorRole(user?.role);
  const defaultView: ActiveView = isInstructor ? "instructor-home" : "home";
  const initialView = (searchParams.get("view") as ActiveView) ?? (location.state as { view?: ActiveView } | null)?.view ?? defaultView;
  const [activeView, setActiveView] = useState<ActiveView>(initialView);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  const showLessons = activeCourseId !== null;
  const meta = showLessons
    ? { title: "محتوى الدورة", subtitle: "إدارة الدروس والمحتوى" }
    : VIEW_META[activeView];

  const goTo = (view: ActiveView) => {
    console.log("goTo called with:", view);
    setActiveCourseId(null);
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
                key={showLessons ? `lessons:${activeCourseId}` : activeView}
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
                ) : (
                  <>
                    {activeView === "home" && <HomePage />}

                    {activeView === "courses" && (
                      <PlaceholderView
                        icon={BookOpen}
                        title="دوراتي"
                        subtitle="ستجد هنا جميع الدورات التي التحقت بها ومتابعة تقدمك فيها"
                        color={PRIMARY}
                      />
                    )}

                    {activeView === "explore" && (
                      <PlaceholderView
                        icon={Compass}
                        title="استكشاف الدورات"
                        subtitle="اكتشف مئات الدورات التعليمية في مجالات اللغة العربية وآدابها"
                        color="#27AE60"
                      />
                    )}

                    {activeView === "profile" && <ProfileView />}

                    {activeView === "instructor-home" && (
                      <InstructorHomeView
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
