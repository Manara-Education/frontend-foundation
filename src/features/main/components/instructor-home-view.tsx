import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  GraduationCap,
  BookOpen,
  ChevronLeft,
  Plus,
  Sparkles,
  Calendar,
  DollarSign,
  PlayCircle,
  Clock3,
} from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";

const PRIMARY   = "#4E5B92";
const FONT      = "'Cairo', sans-serif";
const TEXT_DARK = "#1A1F3C";
const TEXT_MID  = "#6B708A";
const TEXT_MUTE = "#A8ADCA";
const BORDER    = "rgba(78,91,146,0.09)";

// ─────────────────────────────────────────────────────────────────────────────
// DATA & UTILS
// ─────────────────────────────────────────────────────────────────────────────

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} ساعة${minutes > 0 ? ` و ${minutes} دقيقة` : ""}`;
  }
  return `${Math.max(1, minutes)} دقيقة`;
}

import { useCallback } from "react";
import { apiClient, type ApiResponse } from "@/shared/api";
import { useAuth } from "@/shared/auth";

interface Course {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  description?: string;
  duration?: number;
  lessonCount?: number;
  price: number;
  studentsCount?: number;
  instructorId?: number;
  instructorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyCourses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<ApiResponse<Course[]>>("/v1/courses/my-courses");
      setCourses(data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { courses, loading, fetchMyCourses };
}



// ─────────────────────────────────────────────────────────────────────────────
// SHIMMER / SKELETON
// ─────────────────────────────────────────────────────────────────────────────

const SHIMMER_CSS = `
  @keyframes ihv-sh {
    0%   { background-position: -640px 0; }
    100% { background-position:  640px 0; }
  }
  .ihv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 38%,#F4F5FB 52%,#EAECF5 62%,#EAECF5 100%);
    background-size: 640px 100%;
    animation: ihv-sh 1.7s ease-in-out infinite;
  }
`;

function Sk({
  w, h, r = 10, style,
}: {
  w?: number | string; h: number | string; r?: number; style?: React.CSSProperties;
}) {
  return (
    <div
      className="ihv-sk"
      style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }}
    />
  );
}

function PageSkeleton() {
  return (
    <>
      <style>{SHIMMER_CSS}</style>

      {/* Greeting */}
      <div className="mb-10 flex flex-col gap-3">
        <Sk h={13} w={160} r={6} />
        <Sk h={34} w={300} r={11} />
        <Sk h={16} w={240} r={7} />
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-3xl p-7"
            style={{ background: "#fff", border: `1px solid ${BORDER}` }}
          >
            <Sk h={44} w={44} r={14} style={{ marginBottom: 20 }} />
            <Sk h={48} w="55%" r={12} style={{ marginBottom: 10 }} />
            <Sk h={14} w="78%" r={6} />
          </div>
        ))}
      </div>

      {/* Section title */}
      <div className="flex items-center justify-between mb-5">
        <Sk h={22} w={150} r={8} />
        <Sk h={15} w={65} r={6} />
      </div>

      {/* Course rows */}
      <div className="flex flex-col gap-3 mb-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex overflow-hidden rounded-2xl"
            style={{ background: "#fff", border: `1px solid ${BORDER}` }}
          >
            <Sk w={128} h={92} r={0} />
            <div className="flex flex-col gap-2.5 justify-center p-5 flex-1">
              <Sk h={17} w="62%" r={7} />
              <Sk h={12} w="42%" r={5} />
              <Sk h={22} w={58} r={8} />
            </div>
          </div>
        ))}
      </div>

      {/* Banner */}
      <Sk h={176} r={28} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────────────────────────────────────

function useCounter(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    let start: number | null = null;

    function step(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    }

    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS CARD
// ─────────────────────────────────────────────────────────────────────────────

function AnalyticsCard({
  value,
  label,
  icon: Icon,
  accentColor = PRIMARY,
  delay = 0,
}: {
  value:       number;
  label:       string;
  icon:        React.ElementType;
  accentColor?: string;
  delay?:      number;
}) {
  const count = useCounter(value, 1400);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      style={{
        background:   "#ffffff",
        borderRadius: 24,
        padding:      "28px 28px 26px",
        border:       `1.5px solid ${BORDER}`,
        boxShadow:    "0 2px 20px rgba(78,91,146,0.05)",
      }}
    >
      {/* Icon */}
      <div
        className="rounded-2xl flex items-center justify-center mb-6"
        style={{
          width:      48,
          height:     48,
          background: `${accentColor}12`,
          color:      accentColor,
        }}
      >
        <Icon size={20} strokeWidth={1.8} />
      </div>

      {/* Number */}
      <div
        dir="ltr"
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize:   46,
          color:      TEXT_DARK,
          lineHeight: 1,
          letterSpacing: -1,
        }}
      >
        {count}
      </div>

      {/* Label */}
      <div
        dir="rtl"
        style={{
          fontFamily: FONT,
          fontSize:   13.5,
          color:      TEXT_MUTE,
          marginTop:  10,
          lineHeight: 1.5,
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSE CARD  (horizontal, RTL)
// ─────────────────────────────────────────────────────────────────────────────

function CourseCard({
  course,
  delay = 0,
  onNavigate,
}: {
  course:      Course;
  delay?:      number;
  onNavigate?: () => void;
}) {
  const [hovered,   setHovered]   = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   "#ffffff",
        borderRadius: 20,
        overflow:     "hidden",
        border:       `1.5px solid ${hovered ? "rgba(78,91,146,0.2)" : BORDER}`,
        boxShadow:    hovered
          ? "0 10px 32px rgba(78,91,146,0.11)"
          : "0 2px 12px rgba(78,91,146,0.045)",
        cursor:      "pointer",
        transition:  "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      <div
        className="flex items-stretch"
        dir="rtl"
        onClick={onNavigate}
        style={{ cursor: onNavigate ? "pointer" : "default" }}
      >

        {/* Thumbnail */}
        <div
          className="flex-shrink-0 relative overflow-hidden"
          style={{ width: 128, minHeight: 92 }}
        >
          {/* Placeholder while loading */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #EAECF5 0%, #DDE0F0 100%)",
              opacity: imgLoaded ? 0 : 1,
              transition: "opacity 0.3s",
            }}
          >
            <BookOpen size={22} style={{ color: "#C4C9DC" }} />
          </div>

          <ImageWithFallback
            src={course.image}
            alt={course.title}
            onLoad={() => setImgLoaded(true)}
            className="w-full h-full object-cover absolute inset-0"
            style={{
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.35s, transform 0.35s",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
          />

          {/* Subtle scrim */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to left, transparent 50%, rgba(26,31,60,0.3) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center px-5 py-4 gap-2">
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize:   15,
              color:      TEXT_DARK,
              lineHeight: 1.4,
            }}
          >
            {course.title}
          </div>



          {/* Badges container */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Price badge */}
            <div
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1"
              style={{
                background: course.price === 0
                  ? "rgba(34,197,94,0.08)"
                  : "rgba(78,91,146,0.07)",
                border: `1px solid ${course.price === 0 ? "rgba(34,197,94,0.18)" : "rgba(78,91,146,0.12)"}`,
              }}
            >
              <DollarSign
                size={10}
                strokeWidth={2.2}
                style={{ color: course.price === 0 ? "#15803D" : PRIMARY, flexShrink: 0 }}
              />
              <span
                style={{
                  fontFamily: FONT,
                  fontSize:   11,
                  fontWeight: 600,
                  color:      course.price === 0 ? "#15803D" : PRIMARY,
                  direction:  "ltr",
                }}
              >
                {course.price === 0 ? "مجانية" : course.price.toFixed(2)}
              </span>
            </div>

            {/* Lesson Count badge */}
            {(course.lessonCount !== undefined && course.lessonCount > 0) && (
              <div
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                style={{
                  background: "rgba(107,112,138,0.06)",
                  border: "1px solid rgba(107,112,138,0.12)",
                }}
              >
                <PlayCircle size={10} style={{ color: TEXT_MID }} strokeWidth={2.2} />
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 600,
                    color: TEXT_MID,
                  }}
                >
                  {course.lessonCount} درس
                </span>
              </div>
            )}

            {/* Duration badge */}
            {(course.duration !== undefined && course.duration > 0) && (
              <div
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                style={{
                  background: "rgba(107,112,138,0.06)",
                  border: "1px solid rgba(107,112,138,0.12)",
                }}
              >
                <Clock3 size={10} style={{ color: TEXT_MID }} strokeWidth={2.2} />
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 600,
                    color: TEXT_MID,
                  }}
                >
                  {formatDuration(course.duration)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hover arrow */}
        <div className="flex items-center pl-5 pr-3 flex-shrink-0">
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 5 }}
            transition={{ duration: 0.18 }}
          >
            <ChevronLeft size={18} style={{ color: PRIMARY }} strokeWidth={2} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

function EmptyCourses({ onCreateCourse }: { onCreateCourse?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center py-16 px-8"
      style={{
        background:   "#ffffff",
        borderRadius: 24,
        border:       `1.5px dashed rgba(78,91,146,0.18)`,
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
        className="rounded-3xl flex items-center justify-center mb-6"
        style={{ width: 72, height: 72, background: "rgba(78,91,146,0.07)" }}
      >
        <BookOpen size={28} style={{ color: PRIMARY }} strokeWidth={1.6} />
      </motion.div>

      <h3
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize:   18,
          color:      TEXT_DARK,
        }}
      >
        لم تقم بإنشاء أي دورة بعد
      </h3>
      <p
        style={{
          fontFamily: FONT,
          fontSize:   13.5,
          color:      TEXT_MUTE,
          marginTop:  8,
          maxWidth:   300,
          lineHeight: 1.8,
        }}
      >
        ابدأ في مشاركة معرفتك مع طلابك من خلال إنشاء دورتك الأولى
      </p>

      <motion.button
        onClick={onCreateCourse}
        whileHover={{ y: -2, boxShadow: "0 10px 28px rgba(78,91,146,0.28)" }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-2 mt-7 rounded-2xl px-6 py-3"
        style={{
          background:  `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
          color:       "#fff",
          border:      "none",
          cursor:      "pointer",
          fontFamily:  FONT,
          fontWeight:  700,
          fontSize:    14,
          boxShadow:   "0 4px 18px rgba(78,91,146,0.24)",
        }}
      >
        <Plus size={16} strokeWidth={2.5} />
        إنشاء دورة جديدة
      </motion.button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE COURSE BANNER
// ─────────────────────────────────────────────────────────────────────────────

function CreateCourseBanner({ onCreateCourse }: { onCreateCourse?: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1,  y: 0  }}
      transition={{ duration: 0.4, delay: 0.22 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden"
      style={{
        background:   "linear-gradient(140deg, #EEF0FA 0%, #E6E9F7 60%, #EBE8F8 100%)",
        borderRadius: 28,
        padding:      "44px 44px 44px",
        border:       `1.5px solid rgba(78,91,146,0.13)`,
        boxShadow:    hovered
          ? "0 16px 48px rgba(78,91,146,0.13)"
          : "0 4px 24px rgba(78,91,146,0.07)",
        transition:   "box-shadow 0.35s",
      }}
    >
      {/* ── Decorative geometry ───────────────────────── */}
      <svg
        aria-hidden
        style={{
          position:      "absolute",
          left:           0,
          top:            0,
          width:         "46%",
          height:        "100%",
          pointerEvents: "none",
          opacity:        0.55,
        }}
        viewBox="0 0 260 180"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Outer rings */}
        <circle cx="30"  cy="90"  r="150" stroke={PRIMARY} strokeWidth="0.7" strokeOpacity="0.25" />
        <circle cx="30"  cy="90"  r="110" stroke={PRIMARY} strokeWidth="0.8" strokeOpacity="0.3"  />
        <circle cx="30"  cy="90"  r="72"  stroke={PRIMARY} strokeWidth="1"   strokeOpacity="0.35" />
        <circle cx="30"  cy="90"  r="38"  stroke={PRIMARY} strokeWidth="1.2" strokeOpacity="0.25" />
        {/* Filled dot */}
        <circle cx="30"  cy="90"  r="8"   fill={PRIMARY}   fillOpacity="0.12"  />
        {/* Accent arc top-right */}
        <circle cx="220" cy="-20" r="80"  stroke={PRIMARY} strokeWidth="0.6" strokeOpacity="0.15" />
        {/* Accent arc bottom-left */}
        <circle cx="-10" cy="200" r="70"  stroke={PRIMARY} strokeWidth="0.6" strokeOpacity="0.15" />
      </svg>

      {/* ── Content ───────────────────────────────────── */}
      <div className="relative flex items-center justify-between" dir="rtl">

        {/* Text */}
        <div className="flex flex-col gap-4" style={{ maxWidth: 420 }}>
          {/* Label pill */}
          <div
            className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 w-fit"
            style={{
              background: "rgba(78,91,146,0.1)",
              border:     "1px solid rgba(78,91,146,0.12)",
            }}
          >
            <Sparkles size={12} style={{ color: PRIMARY }} />
            <span
              style={{
                fontFamily:    FONT,
                fontSize:      11.5,
                fontWeight:    600,
                color:         PRIMARY,
                letterSpacing: 0.4,
              }}
            >
              منارة · ابدأ بالتدريس
            </span>
          </div>

          {/* Quote */}
          <div>
            <h2
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize:   24,
                color:      TEXT_DARK,
                lineHeight: 1.45,
              }}
            >
              شارك علمك…
            </h2>
            <p
              style={{
                fontFamily: FONT,
                fontSize:   16,
                color:      TEXT_MID,
                lineHeight: 1.75,
                marginTop:  4,
              }}
            >
              هناك دائمًا من ينتظر أن يتعلم منك.
            </p>
          </div>

          {/* CTA */}
          <motion.button
            onClick={onCreateCourse}
            whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(78,91,146,0.34)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="flex items-center gap-2.5 rounded-2xl px-6 py-3 w-fit mt-1"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
              color:       "#ffffff",
              border:      "none",
              cursor:      "pointer",
              fontFamily:  FONT,
              fontWeight:  700,
              fontSize:    14,
              boxShadow:   "0 6px 20px rgba(78,91,146,0.28)",
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            إنشاء دورة جديدة
          </motion.button>
        </div>

        {/* Right illustration block (abstract minimal) */}
        <div
          className="flex-shrink-0 hidden md:flex items-center justify-center"
          style={{ width: 130, height: 130, opacity: hovered ? 0.9 : 0.6, transition: "opacity 0.3s" }}
        >
          <svg viewBox="0 0 120 120" fill="none" width={120} height={120}>
            {/* Book-like abstract shape */}
            <rect x="20" y="28" width="80" height="64" rx="10"
              fill={PRIMARY} fillOpacity="0.08"
              stroke={PRIMARY} strokeOpacity="0.2" strokeWidth="1.5"
            />
            <rect x="28" y="36" width="64" height="8" rx="4"
              fill={PRIMARY} fillOpacity="0.22"
            />
            <rect x="28" y="50" width="48" height="6" rx="3"
              fill={PRIMARY} fillOpacity="0.14"
            />
            <rect x="28" y="62" width="56" height="6" rx="3"
              fill={PRIMARY} fillOpacity="0.14"
            />
            <rect x="28" y="74" width="36" height="6" rx="3"
              fill={PRIMARY} fillOpacity="0.1"
            />
            {/* Sparkle dots */}
            <circle cx="92" cy="26" r="5" fill={PRIMARY} fillOpacity="0.18" />
            <circle cx="100" cy="18" r="3" fill={PRIMARY} fillOpacity="0.12" />
            <circle cx="84" cy="19" r="2" fill={PRIMARY} fillOpacity="0.16" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  onCreateCourse?:   () => void;
  onCourseClick?:    (courseId: string) => void;
  onViewAllCourses?: () => void;
}

export function InstructorHomeView({ onCreateCourse, onCourseClick, onViewAllCourses }: Props) {
  const { courses, loading: isLoading, fetchMyCourses } = useCourses();
  const { user } = useAuth();

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  // Format today's date in Arabic
  const todayLabel = new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  }).format(new Date());

  const hasCourses = courses.length > 0;
  
  const totalEnrolled = courses.reduce((acc, course) => acc + (course.studentsCount || 0), 0);

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      <AnimatePresence mode="wait">

        {/* ── SKELETON ────────────────────────────────────────── */}
        {isLoading && (
          <motion.div
            key="sk"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PageSkeleton />
          </motion.div>
        )}

        {/* ── CONTENT ─────────────────────────────────────────── */}
        {!isLoading && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
          >

            {/* ══ 1 · GREETING ════════════════════════════════════ */}
            <section className="mb-10">
              {/* Date pill */}
              

              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                style={{
                  fontFamily:    FONT,
                  fontWeight:    700,
                  fontSize:      30,
                  color:         TEXT_DARK,
                  lineHeight:    1.3,
                  letterSpacing: -0.3,
                }}
              >
                مرحبًا بعودتك، {user?.fullName?.split(" ")[0] || "المدرّب"} 👋
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                style={{
                  fontFamily: FONT,
                  fontSize:   15,
                  color:      TEXT_MID,
                  marginTop:  7,
                  lineHeight: 1.7,
                }}
              >
                استمر في مشاركة المعرفة وصناعة الأثر
              </motion.p>
            </section>

            {/* ══ 2 · ANALYTICS ═══════════════════════════════════ */}
            <section className="mb-10">
              <div className="grid grid-cols-2 gap-4">
                <AnalyticsCard
                  value={totalEnrolled}
                  label="عدد الطلاب المشتركين"
                  icon={Users}
                  delay={0.1}
                />
                <AnalyticsCard
                  value={courses.length}
                  label="الدورات المنشورة"
                  icon={BookOpen}
                  delay={0.16}
                />
              </div>
            </section>

            {/* ══ 3 · RECENT COURSES ══════════════════════════════ */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2
                  style={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize:   19,
                    color:      TEXT_DARK,
                  }}
                >
                  دوراتي الأخيرة
                </h2>

                {hasCourses && (
                  <button
                    className="flex items-center gap-1 transition-colors duration-150"
                    style={{
                      fontFamily: FONT,
                      fontSize:   13,
                      fontWeight: 600,
                      color:      PRIMARY,
                      background: "none",
                      border:     "none",
                      cursor:     "pointer",
                    }}
                    onClick={onViewAllCourses}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "0.75")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity = "1")
                    }
                  >
                    عرض الكل
                    <ChevronLeft size={14} strokeWidth={2} />
                  </button>
                )}
              </div>

              {hasCourses ? (
                <div className="flex flex-col gap-3">
                  {courses.map((course, i) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      delay={0.1 + i * 0.06}
                      onNavigate={() => onCourseClick?.(course.id.toString())}
                    />
                  ))}
                </div>
              ) : (
                <EmptyCourses onCreateCourse={onCreateCourse} />
              )}
            </section>

            {/* ══ 4 · CREATE COURSE BANNER ════════════════════════ */}
            <CreateCourseBanner onCreateCourse={onCreateCourse} />

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}