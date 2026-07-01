import { Search, X, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ExploreCourseCard } from "./explore-course-card";
import type { CourseExploreView } from "../types/explore.types";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";
const TEXT_DARK = "#1A1F3C";
const TEXT_MID = "#6B708A";
const TEXT_MUTE = "#A8ADCA";

interface ExploreFormProps {
  courses: CourseExploreView[];
  filtered: CourseExploreView[];
  query: string;
  isFiltered: boolean;
  onQueryChange: (q: string) => void;
  onResetQuery: () => void;
  onCourseClick?: (id: number) => void;
  enrolledCourseIds?: Set<number>;
}

export function ExploreForm({
  courses,
  filtered,
  query,
  isFiltered,
  onQueryChange,
  onResetQuery,
  onCourseClick,
  enrolledCourseIds,
}: ExploreFormProps) {
  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      {/* Header Title */}
      <section className="mb-9">
        <h1
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 28,
            color: TEXT_DARK,
            lineHeight: 1.3,
            letterSpacing: -0.3,
            margin: 0,
          }}
        >
          استكشاف الدورات
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 14.5, color: TEXT_MID, marginTop: 6, marginBottom: 0, lineHeight: 1.7 }}>
          اكتشف مئات الدورات التعليمية في مجالات اللغة العربية وآدابها
        </p>

        {/* Stats Pill */}
        <div className="flex items-center gap-2.5 mt-5 flex-wrap">
          <div
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{ background: "rgba(78,91,146,0.07)", border: "1px solid rgba(78,91,146,0.12)" }}
          >
            <div className="rounded-full flex-shrink-0" style={{ width: 5, height: 5, background: PRIMARY }} />
            <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: PRIMARY }}>
              {courses.length} دورة متاحة
            </span>
          </div>
        </div>
      </section>

      {/* Search Input */}
      <section className="mb-7">
        <div className="relative">
          <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{ right: 16 }}>
            <Search size={16} style={{ color: TEXT_MUTE }} strokeWidth={1.8} />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="ابحث عن دورة..."
            dir="rtl"
            style={{
              width: "100%",
              height: 50,
              paddingRight: 44,
              paddingLeft: query ? 44 : 18,
              fontFamily: FONT,
              fontSize: 14,
              color: TEXT_DARK,
              background: "#fff",
              border: `1.5px solid rgba(78,91,146,0.13)`,
              borderRadius: 16,
              outline: "none",
              boxShadow: "0 2px 12px rgba(78,91,146,0.05)",
              transition: "border-color 0.18s, box-shadow 0.18s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(78,91,146,0.35)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.08)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(78,91,146,0.13)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(78,91,146,0.05)";
            }}
          />

          {/* Clear button */}
          {query && (
            <button
              onClick={onResetQuery}
              className="absolute inset-y-0 flex items-center"
              style={{ left: 14, background: "none", border: "none", cursor: "pointer", color: TEXT_MUTE }}
            >
              <X size={15} strokeWidth={2} />
            </button>
          )}
        </div>
      </section>

      {/* Courses List */}
      <section>
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col items-center justify-center text-center py-20 px-8"
              style={{ background: "#ffffff", borderRadius: 24, border: "1.5px dashed rgba(78,91,146,0.18)" }}
            >
              <div
                className="rounded-3xl flex items-center justify-center mb-6"
                style={{ width: 80, height: 80, background: "rgba(78,91,146,0.07)" }}
              >
                <BookOpen size={30} style={{ color: PRIMARY }} strokeWidth={1.5} />
              </div>

              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 19, color: TEXT_DARK, margin: "0 0 8px 0" }}>
                لا توجد نتائج مطابقة
              </h3>

              <p style={{ fontFamily: FONT, fontSize: 13.5, color: TEXT_MUTE, margin: 0, maxWidth: 300, lineHeight: 1.9 }}>
                جرّب تغيير كلمة البحث أو إزالة الفلتر المحدد
              </p>

              {isFiltered && (
                <motion.button
                  onClick={onResetQuery}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 mt-7 rounded-2xl px-6 py-3"
                  style={{
                    background: "rgba(78,91,146,0.08)",
                    color: PRIMARY,
                    border: `1.5px solid rgba(78,91,146,0.15)`,
                    cursor: "pointer",
                    fontFamily: FONT,
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  <X size={15} strokeWidth={2.2} />
                  إعادة ضبط البحث
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              <div style={{ fontFamily: FONT, fontSize: 12.5, color: TEXT_MID, marginBottom: 4 }}>
                {filtered.length === courses.length
                  ? `عرض جميع الدورات (${courses.length})`
                  : `${filtered.length} نتيجة من أصل ${courses.length}`}
              </div>

              {filtered.map((course, i) => (
                <ExploreCourseCard
                  key={course.id}
                  course={course}
                  delay={i * 0.05}
                  onNavigate={() => onCourseClick?.(course.id)}
                  isEnrolled={enrolledCourseIds?.has(course.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
