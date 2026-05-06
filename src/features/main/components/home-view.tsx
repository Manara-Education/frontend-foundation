import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, ChevronLeft, Star, Clock, CheckCircle, BookOpen } from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";

const PRIMARY = "#4E5B92";

// ── Data ──────────────────────────────────────────────────────────────────────

const continueLesson = {
  courseTitle: "أساسيات النحو العربي",
  lessonTitle: "الدرس الخامس: المفعول به وأنواعه",
  progress: 42,
  totalLessons: 24,
  completedLessons: 10,
  image:
    "https://images.unsplash.com/photo-1771909752761-d26abe4e60ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBjYWxsaWdyYXBoeSUyMGFydCUyMGVsZWdhbnR8ZW58MXx8fHwxNzc2Njg1MjU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
};

const enrolledCourses = [
  { id: 1, title: "أساسيات النحو العربي", subtitle: "قواعد وتطبيقات شاملة", progress: 42, lessons: 24, image: "https://images.unsplash.com/photo-1771909752761-d26abe4e60ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBjYWxsaWdyYXBoeSUyMGFydCUyMGVsZWdhbnR8ZW58MXx8fHwxNzc2Njg1MjU1fDA&ixlib=rb-4.1.0&q=80&w=1080", tag: "نشط", tagColor: PRIMARY },
  { id: 2, title: "مهارات الكتابة الإبداعية", subtitle: "من الفكرة إلى النص المتكامل", progress: 78, lessons: 18, image: "https://images.unsplash.com/photo-1623314556929-69d34cb19010?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBsYW5ndWFnZSUyMGxlYXJuaW5nJTIwc3R1ZHklMjBib29rc3xlbnwxfHx8fDE3NzY2ODUyNTV8MA&ixlib=rb-4.1.0&q=80&w=1080", tag: "متقدم", tagColor: "#27AE60" },
  { id: 3, title: "فن التلاوة والتجويد", subtitle: "أحكام التجويد مع التطبيق العملي", progress: 15, lessons: 30, image: "https://images.unsplash.com/photo-1626792504254-c564b7f046a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxRdXJhbiUyMHJlY2l0YXRpb24lMjBJc2xhbWljJTIwbGl0ZXJhdHVyZXxlbnwxfHx8fDE3NzY2ODUyNjB8MA&ixlib=rb-4.1.0&q=80&w=1080", tag: "جديد", tagColor: "#E8A020" },
  { id: 4, title: "الشعر العربي الكلاسيكي", subtitle: "الأوزان والبحور وأعلام الشعراء", progress: 60, lessons: 20, image: "https://images.unsplash.com/photo-1622137879013-beaca5144a4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBwb2V0cnklMjBsaXRlcmF0dXJlJTIwbWFudXNjcmlwdHxlbnwxfHx8fDE3NzY2ODUyNjF8MA&ixlib=rb-4.1.0&q=80&w=1080", tag: "نشط", tagColor: PRIMARY },
];

const recommendations = [
  { id: 1, title: "البلاغة العربية المتقدمة", desc: "استكشف أسرار البيان والبديع والمعاني في الأدب العربي", level: "متوسط", levelColor: "#E8A020", rating: 4.8, hours: 14, image: "https://images.unsplash.com/photo-1715163545155-dbf1680462ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjB3cml0aW5nJTIwZ3JhbW1hciUyMGxpbmd1aXN0aWNzfGVufDF8fHx8MTc3NjY4NTI2MHww&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 2, title: "اللغة العربية للأعمال", desc: "مهارات التواصل المهني والكتابة الرسمية في بيئة الأعمال", level: "مبتدئ", levelColor: "#27AE60", rating: 4.6, hours: 10, image: "https://images.unsplash.com/photo-1762330918491-f4288a62adb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGVkdWNhdGlvbiUyMGRpZ2l0YWwlMjBjb3Vyc2V8ZW58MXx8fHwxNzc2Njg1MjY2fDA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 3, title: "الحضارة العربية الإسلامية", desc: "رحلة عبر التاريخ والتراث والإسهامات الإنسانية الكبرى", level: "مبتدئ", levelColor: "#27AE60", rating: 4.9, hours: 18, image: "https://images.unsplash.com/photo-1762380371789-faf81ed3675d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBjdWx0dXJlJTIwaGVyaXRhZ2UlMjBhcmNoaXRlY3R1cmUlMjBnZW9tZXRyaWN8ZW58MXx8fHwxNzc2Njg1MjY1fDA&ixlib=rb-4.1.0&q=80&w=1080" },
];

// ── Skeleton ───────────────────────────────────────────────────────────────────

const SHIMMER = `
  @keyframes hv-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .hv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 35%,#F4F5FB 50%,#EAECF5 65%,#EAECF5 100%);
    background-size: 600px 100%;
    animation: hv-shimmer 1.9s ease-in-out infinite;
  }
`;

function Sk({ w, h, r = 10, style = {} }: { w?: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="hv-sk" style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }} />;
}

function HomeViewSkeleton() {
  return (
    <>
      <style>{SHIMMER}</style>
      {/* Welcome */}
      <div className="flex flex-col gap-2 mb-6">
        <Sk h={28} w={200} r={10} />
        <Sk h={15} w={280} r={7} />
      </div>

      {/* Hero card */}
      <div className="rounded-3xl overflow-hidden mb-8" style={{ height: 200 }}>
        <Sk h={200} r={0} />
      </div>

      {/* Section title */}
      <div className="flex items-center justify-between mb-4">
        <Sk h={20} w={140} r={8} />
        <Sk h={16} w={60} r={7} />
      </div>

      {/* Enrolled cards */}
      <div className="flex gap-4 overflow-hidden mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 rounded-2xl overflow-hidden" style={{ width: 200 }}>
            <Sk h={110} r={0} />
            <div style={{ background: "#fff", padding: "12px 12px 14px" }} className="flex flex-col gap-2">
              <Sk h={14} w="80%" r={6} />
              <Sk h={11} w="60%" r={5} />
              <Sk h={6} r={99} style={{ marginTop: 6 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="flex items-center justify-between mb-4">
        <Sk h={20} w={120} r={8} />
        <Sk h={16} w={60} r={7} />
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <Sk h={140} r={0} />
            <div style={{ background: "#fff", padding: "14px" }} className="flex flex-col gap-2">
              <Sk h={15} w="75%" r={6} />
              <Sk h={12} w="90%" r={5} />
              <Sk h={12} w="60%" r={5} />
              <Sk h={36} r={10} style={{ marginTop: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 48, stroke = 4 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

function EnrolledCard({ course }: { course: typeof enrolledCourses[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-shrink-0 flex flex-col overflow-hidden cursor-pointer"
      style={{
        width: 210,
        borderRadius: 18,
        background: "#ffffff",
        border: `1.5px solid ${hovered ? "rgba(78,91,146,0.2)" : "rgba(78,91,146,0.08)"}`,
        boxShadow: hovered ? "0 8px 24px rgba(78,91,146,0.13)" : "0 2px 10px rgba(78,91,146,0.06)",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
    >
      <div className="relative overflow-hidden" style={{ height: 116 }}>
        <ImageWithFallback src={course.image} alt={course.title} className="w-full h-full object-cover" style={{ transition: "transform 0.3s", transform: hovered ? "scale(1.05)" : "scale(1)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(14,18,42,0.45) 100%)" }} />
        <div className="absolute top-2.5 right-2.5 rounded-lg px-2 py-0.5" style={{ background: course.tagColor, fontFamily: "'Cairo', sans-serif", color: "#fff", fontSize: 10, fontWeight: 600 }}>
          {course.tag}
        </div>
      </div>
      <div className="p-3.5 flex flex-col gap-2 flex-1" dir="rtl">
        <div>
          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, color: "#1E2340", lineHeight: 1.5 }}>{course.title}</div>
          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 400, fontSize: 11, color: "#9BA3C4", marginTop: 2 }}>{course.subtitle}</div>
        </div>
        <div className="flex flex-col gap-1 mt-auto">
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 10, color: "#9BA3C4" }}>{course.lessons} درس</span>
            <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 11, color: PRIMARY }}>{course.progress}٪</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: "rgba(78,91,146,0.1)" }}>
            <div className="h-full rounded-full" style={{ width: `${course.progress}%`, background: `linear-gradient(90deg, ${PRIMARY} 0%, #6B7AB8 100%)` }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RecommendCard({ course }: { course: typeof recommendations[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col overflow-hidden cursor-pointer"
      style={{
        borderRadius: 18,
        background: "#ffffff",
        border: `1.5px solid ${hovered ? "rgba(78,91,146,0.2)" : "rgba(78,91,146,0.08)"}`,
        boxShadow: hovered ? "0 8px 24px rgba(78,91,146,0.12)" : "0 2px 10px rgba(78,91,146,0.05)",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
    >
      <div className="relative overflow-hidden" style={{ height: 140 }}>
        <ImageWithFallback src={course.image} alt={course.title} className="w-full h-full object-cover" style={{ transition: "transform 0.3s", transform: hovered ? "scale(1.04)" : "scale(1)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(14,18,42,0.05) 0%, rgba(14,18,42,0.55) 100%)" }} />
        <div className="absolute bottom-2.5 right-2.5 rounded-lg px-2 py-0.5" style={{ background: course.levelColor, fontFamily: "'Cairo', sans-serif", color: "#fff", fontSize: 10, fontWeight: 600 }}>
          {course.level}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2.5 flex-1" dir="rtl">
        <div>
          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, color: "#1E2340", lineHeight: 1.5 }}>{course.title}</div>
          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 400, fontSize: 12, color: "#717182", marginTop: 3, lineHeight: 1.7 }}>{course.desc}</div>
        </div>
        <div className="flex items-center gap-4 mt-auto">
          <div className="flex items-center gap-1">
            <Star size={12} fill="#E8A020" color="#E8A020" />
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, fontWeight: 600, color: "#4A4A6A" }}>{course.rating}</span>
          </div>
          <div className="flex items-center gap-1" style={{ color: "#9BA3C4" }}>
            <Clock size={12} />
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11 }}>{course.hours} ساعة</span>
          </div>
        </div>
        <button
          className="w-full rounded-xl py-2 transition-all duration-150"
          style={{
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 600,
            fontSize: 12,
            background: hovered ? PRIMARY : "rgba(78,91,146,0.07)",
            color: hovered ? "#fff" : PRIMARY,
            border: "none",
            cursor: "pointer",
          }}
        >
          عرض الدورة
        </button>
      </div>
    </motion.div>
  );
}

// ── HomeView ───────────────────────────────────────────────────────────────────

export function HomeView() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <HomeViewSkeleton />
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

            {/* ── WELCOME ─────────────────────────────────────────────── */}
            <div className="mb-7">
              <h1 style={{ fontWeight: 700, fontSize: 24, color: "#1E2340", lineHeight: 1.3 }}>
                أهلاً، أحمد 👋
              </h1>
              <p style={{ fontSize: 14, color: "#717182", marginTop: 4 }}>
                استمر في رحلة تعلّمك اليوم
              </p>
            </div>

            {/* ── CONTINUE LEARNING HERO ──────────────────────────────── */}
            <div
              className="relative overflow-hidden rounded-3xl mb-8 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #2D3563 0%, #4E5B92 55%, #7080B8 100%)" }}
            >
              {/* Background image */}
              <div className="absolute inset-0 opacity-20">
                <ImageWithFallback src={continueLesson.image} alt="" className="w-full h-full object-cover" />
              </div>
              {/* Decorative circles */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 700 200" preserveAspectRatio="xMidYMid slice" fill="none">
                <circle cx="620" cy="-30" r="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <circle cx="50" cy="240" r="160" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </svg>

              <div className="relative flex items-center justify-between px-7 py-6" dir="rtl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="rounded-lg px-2.5 py-0.5" style={{ background: "rgba(255,255,255,0.15)", fontFamily: "'Cairo', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                      واصل التعلم
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 18, color: "#ffffff", lineHeight: 1.4 }}>
                    {continueLesson.courseTitle}
                  </div>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.72)", marginTop: 4, lineHeight: 1.6 }}>
                    {continueLesson.lessonTitle}
                  </div>

                  {/* Progress */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: "rgba(255,255,255,0.18)" }}>
                      <div className="h-full rounded-full" style={{ width: `${continueLesson.progress}%`, background: "rgba(255,255,255,0.85)" }} />
                    </div>
                    <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {continueLesson.progress}٪
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                      <CheckCircle size={13} />
                      <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12 }}>
                        {continueLesson.completedLessons}/{continueLesson.totalLessons} درس
                      </span>
                    </div>
                  </div>
                </div>

                {/* Play button */}
                <div className="flex flex-col items-center gap-2 mr-6 flex-shrink-0">
                  <ProgressRing pct={continueLesson.progress} size={56} stroke={4} />
                  <button
                    className="flex items-center justify-center rounded-2xl transition-all duration-150"
                    style={{
                      width: 52,
                      height: 52,
                      background: "#ffffff",
                      color: PRIMARY,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                      marginTop: -6,
                    }}
                  >
                    <Play size={20} fill={PRIMARY} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── MY COURSES ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <BookOpen size={16} style={{ color: PRIMARY }} />
                <h2 style={{ fontWeight: 700, fontSize: 17, color: "#1E2340" }}>دوراتي</h2>
              </div>
              <button
                className="flex items-center gap-1 transition-colors duration-150"
                style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, fontWeight: 600, color: PRIMARY, background: "none", border: "none", cursor: "pointer" }}
              >
                عرض الكل
                <ChevronLeft size={14} />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 mb-8" style={{ scrollbarWidth: "none" }}>
              {enrolledCourses.map((c) => (
                <EnrolledCard key={c.id} course={c} />
              ))}
            </div>

            {/* ── RECOMMENDATIONS ─────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div style={{ fontSize: 16 }}>✨</div>
                <h2 style={{ fontWeight: 700, fontSize: 17, color: "#1E2340" }}>مقترح لك</h2>
              </div>
              <button
                className="flex items-center gap-1 transition-colors duration-150"
                style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, fontWeight: 600, color: PRIMARY, background: "none", border: "none", cursor: "pointer" }}
              >
                استكشف
                <ChevronLeft size={14} />
              </button>
            </div>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}
            >
              {recommendations.map((c) => (
                <RecommendCard key={c.id} course={c} />
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
