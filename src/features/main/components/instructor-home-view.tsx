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
} from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";

const PRIMARY   = "#4E5B92";
const FONT      = "'Cairo', sans-serif";
const TEXT_DARK = "#1A1F3C";
const TEXT_MID  = "#6B708A";
const TEXT_MUTE = "#A8ADCA";
const BORDER    = "rgba(78,91,146,0.09)";

const ANALYTICS = {
  enrolled:  300,
  completed:  87,
};

type CourseStatus = "published" | "draft";
interface Course {
  id:        number;
  title:     string;
  updatedAt: string;
  status:    CourseStatus;
  image:     string;
}

const COURSES: Course[] = [
  {
    id: 1,
    title: "أساسيات النحو العربي",
    updatedAt: "6 مايو 2026",
    status: "published",
    image: "https://images.unsplash.com/photo-1771909752761-d26abe4e60ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBjYWxsaWdyYXBoeSUyMGFydCUyMGVsZWdhbnR8ZW58MXx8fHwxNzc2Njg1MjU1fDA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 2,
    title: "مهارات الكتابة الإبداعية",
    updatedAt: "29 أبريل 2026",
    status: "published",
    image: "https://images.unsplash.com/photo-1623314556929-69d34cb19010?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBsYW5ndWFnZSUyMGxlYXJuaW5nJTIwc3R1ZHklMjBib29rc3xlbnwxfHx8fDE3NzY2ODUyNTV8MA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 3,
    title: "فن التلاوة والتجويد",
    updatedAt: "15 أبريل 2026",
    status: "draft",
    image: "https://images.unsplash.com/photo-1626792504254-c564b7f046a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxRdXJhbiUyMHJlY2l0YXRpb24lMjBJc2xhbWljJTIwbGl0ZXJhdHVyZXxlbnwxfHx8fDE3NzY2ODUyNjB8MA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 4,
    title: "الشعر العربي الكلاسيكي",
    updatedAt: "2 أبريل 2026",
    status: "draft",
    image: "https://images.unsplash.com/photo-1622137879013-beaca5144a4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBwb2V0cnklMjBsaXRlcmF0dXJlJTIwbWFudXNjcmlwdHxlbnwxfHx8fDE3NzY2ODUyNjF8MA&ixlib=rb-4.1.0&q=80&w=400",
  },
];

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

function Sk({ w, h, r = 10, style }: { w?: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return (
    <div className="ihv-sk" style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }} />
  );
}

function PageSkeleton() {
  return (
    <>
      <style>{SHIMMER_CSS}</style>
      <div className="mb-10 flex flex-col gap-3">
        <Sk h={13} w={160} r={6} />
        <Sk h={34} w={300} r={11} />
        <Sk h={16} w={240} r={7} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-10">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-3xl p-7" style={{ background: "#fff", border: `1px solid ${BORDER}` }}>
            <Sk h={44} w={44} r={14} style={{ marginBottom: 20 }} />
            <Sk h={48} w="55%" r={12} style={{ marginBottom: 10 }} />
            <Sk h={14} w="78%" r={6} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-5">
        <Sk h={22} w={150} r={8} />
        <Sk h={15} w={65} r={6} />
      </div>
      <div className="flex flex-col gap-3 mb-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex overflow-hidden rounded-2xl" style={{ background: "#fff", border: `1px solid ${BORDER}` }}>
            <Sk w={128} h={92} r={0} />
            <div className="flex flex-col gap-2.5 justify-center p-5 flex-1">
              <Sk h={17} w="62%" r={7} />
              <Sk h={12} w="42%" r={5} />
              <Sk h={22} w={58} r={8} />
            </div>
          </div>
        ))}
      </div>
      <Sk h={176} r={28} />
    </>
  );
}

function useCounter(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    let start: number | null = null;
    function step(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    }
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

function AnalyticsCard({ value, label, icon: Icon, accentColor = PRIMARY, delay = 0 }: { value: number; label: string; icon: React.ElementType; accentColor?: string; delay?: number; }) {
  const count = useCounter(value, 1400);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      style={{ background: "#ffffff", borderRadius: 24, padding: "28px 28px 26px", border: `1.5px solid ${BORDER}`, boxShadow: "0 2px 20px rgba(78,91,146,0.05)" }}
    >
      <div className="rounded-2xl flex items-center justify-center mb-6" style={{ width: 48, height: 48, background: `${accentColor}12`, color: accentColor }}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <div dir="ltr" style={{ fontFamily: FONT, fontWeight: 700, fontSize: 46, color: TEXT_DARK, lineHeight: 1, letterSpacing: -1 }}>
        {count}
      </div>
      <div dir="rtl" style={{ fontFamily: FONT, fontSize: 13.5, color: TEXT_MUTE, marginTop: 10, lineHeight: 1.5 }}>
        {label}
      </div>
    </motion.div>
  );
}

const STATUS_CONFIG: Record<CourseStatus, { label: string; bg: string; color: string; dot: string }> = {
  published: { label: "منشور",  bg: "rgba(39,174,96,0.1)",   color: "#27AE60", dot: "#27AE60" },
  draft:     { label: "مسودة",  bg: "rgba(155,163,196,0.14)", color: "#9BA3C4", dot: "#B8BDCC" },
};

function CourseCard({ course, delay = 0, onNavigate }: { course: Course; delay?: number; onNavigate?: () => void; }) {
  const [hovered,   setHovered]   = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const st = STATUS_CONFIG[course.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: "#ffffff", borderRadius: 20, overflow: "hidden", border: `1.5px solid ${hovered ? "rgba(78,91,146,0.2)" : BORDER}`, boxShadow: hovered ? "0 10px 32px rgba(78,91,146,0.11)" : "0 2px 12px rgba(78,91,146,0.045)", cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s" }}
    >
      <div className="flex items-stretch" dir="rtl" onClick={onNavigate} style={{ cursor: onNavigate ? "pointer" : "default" }}>
        <div className="flex-shrink-0 relative overflow-hidden" style={{ width: 128, minHeight: 92 }}>
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #EAECF5 0%, #DDE0F0 100%)", opacity: imgLoaded ? 0 : 1, transition: "opacity 0.3s" }}>
            <BookOpen size={22} style={{ color: "#C4C9DC" }} />
          </div>
          <ImageWithFallback src={course.image} alt={course.title} onLoad={() => setImgLoaded(true)} className="w-full h-full object-cover absolute inset-0" style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.35s, transform 0.35s", transform: hovered ? "scale(1.06)" : "scale(1)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to left, transparent 50%, rgba(26,31,60,0.3) 100%)" }} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center px-5 py-4 gap-2">
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: TEXT_DARK, lineHeight: 1.4 }}>{course.title}</div>
          <div className="flex items-center gap-1.5" style={{ fontFamily: FONT, fontSize: 12, color: TEXT_MUTE }}>
            <Calendar size={11} strokeWidth={1.8} />
            آخر تحديث: {course.updatedAt}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 w-fit" style={{ background: st.bg }}>
            <div className="rounded-full flex-shrink-0" style={{ width: 5, height: 5, background: st.dot }} />
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: st.color }}>{st.label}</span>
          </div>
        </div>
        <div className="flex items-center pl-5 pr-3 flex-shrink-0">
          <motion.div animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 5 }} transition={{ duration: 0.18 }}>
            <ChevronLeft size={18} style={{ color: PRIMARY }} strokeWidth={2} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyCourses({ onCreateCourse }: { onCreateCourse?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center text-center py-16 px-8" style={{ background: "#ffffff", borderRadius: 24, border: `1.5px dashed rgba(78,91,146,0.18)` }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }} className="rounded-3xl flex items-center justify-center mb-6" style={{ width: 72, height: 72, background: "rgba(78,91,146,0.07)" }}>
        <BookOpen size={28} style={{ color: PRIMARY }} strokeWidth={1.6} />
      </motion.div>
      <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: TEXT_DARK }}>لم تقم بإنشاء أي دورة بعد</h3>
      <p style={{ fontFamily: FONT, fontSize: 13.5, color: TEXT_MUTE, marginTop: 8, maxWidth: 300, lineHeight: 1.8 }}>ابدأ في مشاركة معرفتك مع طلابك من خلال إنشاء دورتك الأولى</p>
      <motion.button onClick={onCreateCourse} whileHover={{ y: -2, boxShadow: "0 10px 28px rgba(78,91,146,0.28)" }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className="flex items-center gap-2 mt-7 rounded-2xl px-6 py-3" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`, color: "#fff", border: "none", cursor: "pointer", fontFamily: FONT, fontWeight: 700, fontSize: 14, boxShadow: "0 4px 18px rgba(78,91,146,0.24)" }}>
        <Plus size={16} strokeWidth={2.5} />
        إنشاء دورة جديدة
      </motion.button>
    </motion.div>
  );
}

function CreateCourseBanner({ onCreateCourse }: { onCreateCourse?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.22 }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="relative overflow-hidden" style={{ background: "linear-gradient(140deg, #EEF0FA 0%, #E6E9F7 60%, #EBE8F8 100%)", borderRadius: 28, padding: "44px 44px 44px", border: `1.5px solid rgba(78,91,146,0.13)`, boxShadow: hovered ? "0 16px 48px rgba(78,91,146,0.13)" : "0 4px 24px rgba(78,91,146,0.07)", transition: "box-shadow 0.35s" }}>
      <svg aria-hidden style={{ position: "absolute", left: 0, top: 0, width: "46%", height: "100%", pointerEvents: "none", opacity: 0.55 }} viewBox="0 0 260 180" preserveAspectRatio="xMidYMid slice" fill="none">
        <circle cx="30" cy="90" r="150" stroke={PRIMARY} strokeWidth="0.7" strokeOpacity="0.25" />
        <circle cx="30" cy="90" r="110" stroke={PRIMARY} strokeWidth="0.8" strokeOpacity="0.3" />
        <circle cx="30" cy="90" r="72" stroke={PRIMARY} strokeWidth="1" strokeOpacity="0.35" />
        <circle cx="30" cy="90" r="38" stroke={PRIMARY} strokeWidth="1.2" strokeOpacity="0.25" />
        <circle cx="30" cy="90" r="8" fill={PRIMARY} fillOpacity="0.12" />
        <circle cx="220" cy="-20" r="80" stroke={PRIMARY} strokeWidth="0.6" strokeOpacity="0.15" />
        <circle cx="-10" cy="200" r="70" stroke={PRIMARY} strokeWidth="0.6" strokeOpacity="0.15" />
      </svg>
      <div className="relative flex items-center justify-between" dir="rtl">
        <div className="flex flex-col gap-4" style={{ maxWidth: 420 }}>
          <div className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 w-fit" style={{ background: "rgba(78,91,146,0.1)", border: "1px solid rgba(78,91,146,0.12)" }}>
            <Sparkles size={12} style={{ color: PRIMARY }} />
            <span style={{ fontFamily: FONT, fontSize: 11.5, fontWeight: 600, color: PRIMARY, letterSpacing: 0.4 }}>منارة · ابدأ بالتدريس</span>
          </div>
          <div>
            <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 24, color: TEXT_DARK, lineHeight: 1.45 }}>شارك علمك…</h2>
            <p style={{ fontFamily: FONT, fontSize: 16, color: TEXT_MID, lineHeight: 1.75, marginTop: 4 }}>هناك دائمًا من ينتظر أن يتعلم منك.</p>
          </div>
          <motion.button onClick={onCreateCourse} whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(78,91,146,0.34)" }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.16 }} className="flex items-center gap-2.5 rounded-2xl px-6 py-3 w-fit mt-1" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`, color: "#ffffff", border: "none", cursor: "pointer", fontFamily: FONT, fontWeight: 700, fontSize: 14, boxShadow: "0 6px 20px rgba(78,91,146,0.28)" }}>
            <Plus size={16} strokeWidth={2.5} />
            إنشاء دورة جديدة
          </motion.button>
        </div>
        <div className="flex-shrink-0 hidden md:flex items-center justify-center" style={{ width: 130, height: 130, opacity: hovered ? 0.9 : 0.6, transition: "opacity 0.3s" }}>
          <svg viewBox="0 0 120 120" fill="none" width={120} height={120}>
            <rect x="20" y="28" width="80" height="64" rx="10" fill={PRIMARY} fillOpacity="0.08" stroke={PRIMARY} strokeOpacity="0.2" strokeWidth="1.5" />
            <rect x="28" y="36" width="64" height="8" rx="4" fill={PRIMARY} fillOpacity="0.22" />
            <rect x="28" y="50" width="48" height="6" rx="3" fill={PRIMARY} fillOpacity="0.14" />
            <rect x="28" y="62" width="56" height="6" rx="3" fill={PRIMARY} fillOpacity="0.14" />
            <rect x="28" y="74" width="36" height="6" rx="3" fill={PRIMARY} fillOpacity="0.1" />
            <circle cx="92" cy="26" r="5" fill={PRIMARY} fillOpacity="0.18" />
            <circle cx="100" cy="18" r="3" fill={PRIMARY} fillOpacity="0.12" />
            <circle cx="84" cy="19" r="2" fill={PRIMARY} fillOpacity="0.16" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

interface Props {
  onCreateCourse?:   () => void;
  onCourseClick?:    (courseTitle: string) => void;
  onViewAllCourses?: () => void;
}

export function InstructorHomeView({ onCreateCourse, onCourseClick, onViewAllCourses }: Props) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const todayLabel = new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  }).format(new Date());

  const hasCourses = COURSES.length > 0;

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <PageSkeleton />
          </motion.div>
        )}

        {!isLoading && (
          <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.32 }}>
            <section className="mb-10">
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 mb-4" style={{ background: "rgba(78,91,146,0.07)", border: `1px solid rgba(78,91,146,0.1)` }}>
                <div className="rounded-full" style={{ width: 6, height: 6, background: "#27AE60", boxShadow: "0 0 0 2.5px rgba(39,174,96,0.22)" }} />
                <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, color: TEXT_MUTE }}>{todayLabel}</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, color: TEXT_DARK, lineHeight: 1.3, letterSpacing: -0.3 }}>
                مرحبًا بعودتك، أحمد 👋
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={{ fontFamily: FONT, fontSize: 15, color: TEXT_MID, marginTop: 7, lineHeight: 1.7 }}>
                استمر في مشاركة المعرفة وصناعة الأثر
              </motion.p>
            </section>

            <section className="mb-10">
              <div className="grid grid-cols-2 gap-4">
                <AnalyticsCard value={ANALYTICS.enrolled} label="عدد الطلاب المشتركين" icon={Users} delay={0.1} />
                <AnalyticsCard value={ANALYTICS.completed} label="الطلاب الذين أكملوا الدورات" icon={GraduationCap} delay={0.16} />
              </div>
            </section>

            <section className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 19, color: TEXT_DARK }}>دوراتي الأخيرة</h2>
                {hasCourses && (
                  <button className="flex items-center gap-1 transition-colors duration-150" style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: PRIMARY, background: "none", border: "none", cursor: "pointer" }} onClick={onViewAllCourses} onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                    عرض الكل
                    <ChevronLeft size={14} strokeWidth={2} />
                  </button>
                )}
              </div>

              {hasCourses ? (
                <div className="flex flex-col gap-3">
                  {COURSES.map((course, i) => (
                    <CourseCard key={course.id} course={course} delay={0.1 + i * 0.06} onNavigate={() => onCourseClick?.(course.title)} />
                  ))}
                </div>
              ) : (
                <EmptyCourses onCreateCourse={onCreateCourse} />
              )}
            </section>

            <CreateCourseBanner onCreateCourse={onCreateCourse} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
