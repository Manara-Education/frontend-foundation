/**
 * The "استكشاف الدورات" screen: breadcrumb, heading, search, and the responsive grid of
 * course tiles.
 *
 * The result count lives inside the search field rather than on a line of its own, which
 * is where the reference puts it and what the standalone "عرض جميع الدورات (N)" line used
 * to say twice over.
 */
import { useState } from "react";
import { ChevronRight, Compass, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ExploreCourseCard } from "./explore-course-card";
import { ExploreEmptyState } from "./explore-empty-state";
import type { CourseExploreView } from "../types/explore.types";
import { BORDER, FONT, PRIMARY, TEXT_DARK, TEXT_MUTE } from "../formatters/explore.formatter";

/**
 * `auto-fill` decides the column count from the width the shell actually gives us, so
 * the grid steps down from four columns to one without a breakpoint naming a viewport.
 * 250px is the narrowest a tile reads at — below it the CTA row starts to crowd.
 */
const GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(250px, 100%), 1fr))",
  gap: 22,
} as const;

interface ExploreFormProps {
  courses: CourseExploreView[];
  filtered: CourseExploreView[];
  query: string;
  isFiltered: boolean;
  onQueryChange: (q: string) => void;
  onResetQuery: () => void;
  onCourseClick?: (id: number) => void;
  onGoHome?: () => void;
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
  onGoHome,
  enrolledCourseIds,
}: ExploreFormProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
        <button
          type="button"
          onClick={onGoHome}
          disabled={!onGoHome}
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: TEXT_MUTE,
            background: "none",
            border: "none",
            cursor: onGoHome ? "pointer" : "default",
            padding: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => {
            if (onGoHome) e.currentTarget.style.color = PRIMARY;
          }}
          onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MUTE)}
        >
          الرئيسية
        </button>
        {/* Same separator the course-details and lesson breadcrumbs use */}
        <ChevronRight size={13} color="#C4C9DE" strokeWidth={2} style={{ flexShrink: 0 }} />
        <span style={{ fontFamily: FONT, fontSize: 13, color: PRIMARY }}>استكشاف الدورات</span>
      </div>

      {/* ── Heading ────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{ marginBottom: 36 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(78,91,146,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PRIMARY,
              flexShrink: 0,
            }}
          >
            <Compass size={20} strokeWidth={1.8} />
          </div>
          <h1
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 30,
              color: TEXT_DARK,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            استكشف الدورات التعليمية
          </h1>
        </div>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 15,
            color: TEXT_MUTE,
            // Indents past the icon tile — inline-start, so RTL indents from the right.
            margin: 0,
            marginInlineStart: 56,
            lineHeight: 1.7,
            maxWidth: 520,
          }}
        >
          ابدأ رحلتك التعليمية واختر الدورة المناسبة لهدفك القادم — {courses.length} دورة متاحة
        </p>
      </motion.section>

      {/* ── Search ─────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{ marginBottom: 36, position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            insetInlineStart: 18,
            top: "50%",
            transform: "translateY(-50%)",
            color: focused ? PRIMARY : "#C4C9DE",
            pointerEvents: "none",
            display: "flex",
            transition: "color 0.18s",
          }}
        >
          <Search size={17} strokeWidth={1.8} />
        </div>

        <input
          type="text"
          dir="rtl"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="ابحث عن دورة، مهارة، أو مجال تعليمي..."
          style={{
            width: "100%",
            height: 52,
            borderRadius: 18,
            border: `1.5px solid ${focused ? "rgba(78,91,146,0.38)" : BORDER}`,
            background: "#FFFFFF",
            paddingInlineStart: 48,
            // Leaves room for the count pill and the clear button on the far edge.
            paddingInlineEnd: query ? 116 : 20,
            fontFamily: FONT,
            fontSize: 14,
            color: TEXT_DARK,
            outline: "none",
            transition: "border-color 0.18s, box-shadow 0.18s, padding 0.18s",
            boxShadow: focused
              ? "0 0 0 4px rgba(78,91,146,0.08), 0 4px 18px rgba(78,91,146,0.07)"
              : "0 2px 12px rgba(78,91,146,0.04)",
            boxSizing: "border-box",
          }}
        />

        {/* Result count and clear, on the edge opposite the search icon */}
        {query.trim() && (
          <motion.div
            // `y` is animated rather than written into `transform`, which motion owns and
            // would otherwise overwrite along with the scale — losing the centring.
            initial={{ opacity: 0, scale: 0.9, y: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            style={{
              position: "absolute",
              insetInlineEnd: 14,
              top: "50%",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: FONT,
                fontSize: 12,
                color: TEXT_MUTE,
                padding: "3px 10px",
                borderRadius: 99,
                background: "rgba(78,91,146,0.06)",
                whiteSpace: "nowrap",
              }}
            >
              {filtered.length} نتيجة
            </span>
            <button
              type="button"
              onClick={onResetQuery}
              aria-label="مسح البحث"
              style={{
                display: "flex",
                alignItems: "center",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: TEXT_MUTE,
              }}
            >
              <X size={15} strokeWidth={2} />
            </button>
          </motion.div>
        )}
      </motion.section>

      {/* ── Courses grid ───────────────────────────────────────────────── */}
      <section>
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <ExploreEmptyState isFiltered={isFiltered} onReset={onResetQuery} />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={GRID_STYLE}
            >
              {filtered.map((course, i) => (
                <ExploreCourseCard
                  key={course.id}
                  course={course}
                  index={i}
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
