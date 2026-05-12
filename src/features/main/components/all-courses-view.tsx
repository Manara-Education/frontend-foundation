import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Search, BookOpen, Calendar, Plus, X } from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";

const PRIMARY   = "#4E5B92";
const FONT      = "'Cairo', sans-serif";
const TEXT_DARK = "#1A1F3C";
const TEXT_MID  = "#6B708A";
const TEXT_MUTE = "#A8ADCA";
const BORDER    = "rgba(78,91,146,0.09)";

type CourseStatus = "published" | "draft";

interface Course {
  id:        number;
  title:     string;
  updatedAt: string;
  status:    CourseStatus;
  image:     string;
}

const ALL_COURSES: Course[] = [
  { id: 1, title: "أساسيات النحو العربي",   updatedAt: "6 مايو 2026",   status: "published", image: "https://images.unsplash.com/photo-1771909752761-d26abe4e60ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBjYWxsaWdyYXBoeSUyMGFydCUyMGVsZWdhbnR8ZW58MXx8fHwxNzc2Njg1MjU1fDA&ixlib=rb-4.1.0&q=80&w=400" },
  { id: 2, title: "مهارات الكتابة الإبداعية", updatedAt: "29 أبريل 2026", status: "published", image: "https://images.unsplash.com/photo-1623314556929-69d34cb19010?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBsYW5ndWFnZSUyMGxlYXJuaW5nJTIwc3R1ZHklMjBib29rc3xlbnwxfHx8fDE3NzY2ODUyNTV8MA&ixlib=rb-4.1.0&q=80&w=400" },
  { id: 3, title: "فن التلاوة والتجويد",       updatedAt: "15 أبريل 2026", status: "draft",     image: "https://images.unsplash.com/photo-1626792504254-c564b7f046a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxRdXJhbiUyMHJlY2l0YXRpb24lMjBJc2xhbWljJTIwbGl0ZXJhdHVyZXxlbnwxfHx8fDE3NzY2ODUyNjB8MA&ixlib=rb-4.1.0&q=80&w=400" },
  { id: 4, title: "الشعر العربي الكلاسيكي",   updatedAt: "2 أبريل 2026",  status: "draft",     image: "https://images.unsplash.com/photo-1622137879013-beaca5144a4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBwb2V0cnklMjBsaXRlcmF0dXJlJTIwbWFudXNjcmlwdHxlbnwxfHx8fDE3NzY2ODUyNjF8MA&ixlib=rb-4.1.0&q=80&w=400" },
  { id: 5, title: "البلاغة وأسرار الفصاحة",   updatedAt: "20 مارس 2026",  status: "published", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmFiaWMlMjBib29rcyUyMGxpYnJhcnklMjBhcmNoaXZlfGVufDF8fHx8MTc3NjY4NTI2MXww&ixlib=rb-4.1.0&q=80&w=400" },
  { id: 6, title: "تاريخ الأدب العربي",        updatedAt: "10 مارس 2026",  status: "draft",     image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmFiaWMlMjBsaW5ndWlzdGljcyUyMHN0dWR5fGVufDF8fHx8MTc3NjY4NTI2MXww&ixlib=rb-4.1.0&q=80&w=400" },
  { id: 7, title: "فقه اللغة والاشتقاق",       updatedAt: "1 مارس 2026",   status: "published", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGRlc2slMjBhcmFiaWMlMjBsYW5ndWFnZXxlbnwxfHx8fDE3NzY2ODUyNjF8MA&ixlib=rb-4.1.0&q=80&w=400" },
];

const STATUS_CONFIG: Record<CourseStatus, { label: string; bg: string; color: string; dot: string }> = {
  published: { label: "منشور",  bg: "rgba(39,174,96,0.1)",   color: "#27AE60", dot: "#27AE60" },
  draft:     { label: "مسودة",  bg: "rgba(155,163,196,0.14)", color: "#9BA3C4", dot: "#B8BDCC" },
};

const SHIMMER_CSS = `
  @keyframes acv-sh {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  .acv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 38%,#F4F5FB 52%,#EAECF5 62%,#EAECF5 100%);
    background-size: 700px 100%;
    animation: acv-sh 1.7s ease-in-out infinite;
  }
`;

function Sk({ w, h, r = 10, style }: { w?: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="acv-sk" style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }} />;
}

function SkeletonCard() {
  return (
    <div className="flex overflow-hidden" style={{ background: "#fff", borderRadius: 20, border: `1.5px solid ${BORDER}` }}>
      <Sk w={128} h={92} r={0} />
      <div className="flex flex-col gap-2.5 justify-center p-5 flex-1">
        <Sk h={17} w="64%" r={7} />
        <Sk h={12} w="42%" r={5} />
        <Sk h={22} w={60} r={8} />
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <>
      <style>{SHIMMER_CSS}</style>
      <div className="mb-10 flex flex-col gap-3">
        <Sk h={13} w={80}  r={6} />
        <Sk h={36} w={200} r={11} />
        <Sk h={15} w={280} r={7} />
      </div>
      <div className="flex gap-3 mb-8">
        <Sk h={48} r={16} style={{ flex: 1 }} />
        <Sk h={48} w={90} r={16} />
        <Sk h={48} w={90} r={16} />
      </div>
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
      </div>
    </>
  );
}

function CourseCard({ course, delay = 0, onNavigate }: { course: Course; delay?: number; onNavigate?: () => void }) {
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
            <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
              <path d="M10 14L5 9L10 4" stroke={PRIMARY} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ isFiltered, onReset, onCreateCourse }: { isFiltered: boolean; onReset: () => void; onCreateCourse?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center text-center py-20 px-8" style={{ background: "#ffffff", borderRadius: 24, border: "1.5px dashed rgba(78,91,146,0.18)" }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }} className="rounded-3xl flex items-center justify-center mb-6" style={{ width: 80, height: 80, background: "rgba(78,91,146,0.07)" }}>
        {isFiltered ? <Search size={30} style={{ color: PRIMARY }} strokeWidth={1.5} /> : <BookOpen size={30} style={{ color: PRIMARY }} strokeWidth={1.5} />}
      </motion.div>
      <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 19, color: TEXT_DARK }}>{isFiltered ? "لا توجد نتائج مطابقة" : "لا توجد دورات حتى الآن"}</h3>
      <p style={{ fontFamily: FONT, fontSize: 13.5, color: TEXT_MUTE, marginTop: 8, maxWidth: 300, lineHeight: 1.9 }}>
        {isFiltered ? "جرّب تغيير كلمة البحث أو إزالة الفلتر المحدد" : "ابدأ في مشاركة معرفتك مع طلابك من خلال إنشاء دورتك الأولى"}
      </p>
      {isFiltered ? (
        <motion.button onClick={onReset} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 mt-7 rounded-2xl px-6 py-3" style={{ background: "rgba(78,91,146,0.08)", color: PRIMARY, border: `1.5px solid rgba(78,91,146,0.15)`, cursor: "pointer", fontFamily: FONT, fontWeight: 600, fontSize: 14 }}>
          <X size={15} strokeWidth={2.2} />
          إعادة ضبط البحث
        </motion.button>
      ) : (
        <motion.button onClick={onCreateCourse} whileHover={{ y: -2, boxShadow: "0 10px 28px rgba(78,91,146,0.28)" }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 mt-7 rounded-2xl px-6 py-3" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`, color: "#fff", border: "none", cursor: "pointer", fontFamily: FONT, fontWeight: 700, fontSize: 14, boxShadow: "0 4px 18px rgba(78,91,146,0.24)" }}>
          <Plus size={16} strokeWidth={2.5} />
          إنشاء دورة جديدة
        </motion.button>
      )}
    </motion.div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ fontFamily: FONT, fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#fff" : TEXT_MID, background: active ? `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)` : "#fff", border: active ? "1.5px solid transparent" : `1.5px solid rgba(78,91,146,0.14)`, borderRadius: 14, padding: "9px 18px", cursor: "pointer", transition: "all 0.18s ease", boxShadow: active ? "0 4px 14px rgba(78,91,146,0.22)" : "0 1px 4px rgba(78,91,146,0.06)", outline: "none", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

interface Props {
  onBack?:         () => void;
  onCourseClick?:  (courseTitle: string) => void;
  onCreateCourse?: () => void;
}

export function AllCoursesView({ onBack, onCourseClick, onCreateCourse }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [query,     setQuery]     = useState("");
  const [filter,    setFilter]    = useState<"all" | CourseStatus>("all");

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const filtered = ALL_COURSES.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  const isFiltered = query.trim() !== "" || filter !== "all";

  const publishedCount = ALL_COURSES.filter((c) => c.status === "published").length;
  const draftCount     = ALL_COURSES.filter((c) => c.status === "draft").length;

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <PageSkeleton />
          </motion.div>
        )}

        {!isLoading && (
          <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <section className="mb-9">
              <motion.button initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 }} onClick={onBack} className="flex items-center gap-1.5 mb-5" style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: TEXT_MID, background: "none", border: "none", cursor: "pointer", padding: 0, outline: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)} onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MID)}>
                <ArrowRight size={15} strokeWidth={2} />
                العودة للرئيسية
              </motion.button>

              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
                <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 28, color: TEXT_DARK, lineHeight: 1.3, letterSpacing: -0.3 }}>دوراتي</h1>
                <p style={{ fontFamily: FONT, fontSize: 14.5, color: TEXT_MID, marginTop: 6, lineHeight: 1.7 }}>قم بإدارة وتعديل جميع الدورات الخاصة بك</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="flex items-center gap-2.5 mt-5 flex-wrap">
                {[
                  { label: `${ALL_COURSES.length} دورة`,  bg: "rgba(78,91,146,0.07)",   color: PRIMARY },
                  { label: `${publishedCount} منشور`,      bg: "rgba(39,174,96,0.09)",   color: "#27AE60" },
                  { label: `${draftCount} مسودة`,          bg: "rgba(155,163,196,0.13)", color: "#9BA3C4" },
                ].map((pill) => (
                  <div key={pill.label} className="flex items-center gap-1.5 rounded-xl px-3 py-1.5" style={{ background: pill.bg, border: `1px solid ${pill.color}18` }}>
                    <div className="rounded-full flex-shrink-0" style={{ width: 5, height: 5, background: pill.color }} />
                    <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: pill.color }}>{pill.label}</span>
                  </div>
                ))}
              </motion.div>
            </section>

            <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mb-7">
              <div className="relative mb-4">
                <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{ right: 16 }}>
                  <Search size={16} style={{ color: TEXT_MUTE }} strokeWidth={1.8} />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن دورة..."
                  dir="rtl"
                  style={{ width: "100%", height: 50, paddingRight: 44, paddingLeft: query ? 44 : 18, fontFamily: FONT, fontSize: 14, color: TEXT_DARK, background: "#fff", border: `1.5px solid rgba(78,91,146,0.13)`, borderRadius: 16, outline: "none", boxShadow: "0 2px 12px rgba(78,91,146,0.05)", transition: "border-color 0.18s, box-shadow 0.18s" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(78,91,146,0.35)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.08)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(78,91,146,0.13)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(78,91,146,0.05)"; }}
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute inset-y-0 flex items-center" style={{ left: 14, background: "none", border: "none", cursor: "pointer", color: TEXT_MUTE }}>
                    <X size={15} strokeWidth={2} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <FilterPill label="الكل"    active={filter === "all"}       onClick={() => setFilter("all")} />
                <FilterPill label="منشور"   active={filter === "published"} onClick={() => setFilter("published")} />
                <FilterPill label="مسودة"   active={filter === "draft"}     onClick={() => setFilter("draft")} />
              </div>
            </motion.section>

            <section>
              <AnimatePresence mode="wait">
                {filtered.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                    <EmptyState isFiltered={isFiltered} onReset={() => { setQuery(""); setFilter("all"); }} onCreateCourse={onCreateCourse} />
                  </motion.div>
                ) : (
                  <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-3">
                    <div style={{ fontFamily: FONT, fontSize: 12.5, color: TEXT_MUTE, marginBottom: 4 }}>
                      {filtered.length === ALL_COURSES.length ? `عرض جميع الدورات (${ALL_COURSES.length})` : `${filtered.length} نتيجة من أصل ${ALL_COURSES.length}`}
                    </div>
                    {filtered.map((course, i) => (
                      <CourseCard key={course.id} course={course} delay={i * 0.05} onNavigate={() => onCourseClick?.(course.title)} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
