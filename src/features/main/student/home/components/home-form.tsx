import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, BookOpen } from "lucide-react";
import { HomeSkeleton } from "./home-skeleton";
import { ContinueLearningHero } from "./continue-learning-hero";
import { EnrolledCard } from "./enrolled-card";
import { RecommendCard } from "./recommend-card";
import type { HomeViewData } from "../types/home.types";

const PRIMARY = "#4E5B92";

interface HomeFormProps {
  isLoading: boolean;
  data: HomeViewData;
}

export function HomeForm({ isLoading, data }: HomeFormProps) {
  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <HomeSkeleton />
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
            <ContinueLearningHero lesson={data.continueLesson} />

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
              {data.enrolledCourses.map((c) => (
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
              {data.recommendations.map((c) => (
                <RecommendCard key={c.id} course={c} />
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
