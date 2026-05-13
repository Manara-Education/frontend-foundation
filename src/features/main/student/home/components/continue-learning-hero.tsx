import { Play, CheckCircle } from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";
import { ProgressRing } from "./progress-ring";
import type { ContinueLesson } from "../types/home.types";

const PRIMARY = "#4E5B92";

export function ContinueLearningHero({ lesson }: { lesson: ContinueLesson }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl mb-8 cursor-pointer"
      style={{ background: "linear-gradient(135deg, #2D3563 0%, #4E5B92 55%, #7080B8 100%)" }}
    >
      {/* Background image */}
      <div className="absolute inset-0 opacity-20">
        <ImageWithFallback src={lesson.image} alt="" className="w-full h-full object-cover" />
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
            {lesson.courseTitle}
          </div>
          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.72)", marginTop: 4, lineHeight: 1.6 }}>
            {lesson.lessonTitle}
          </div>

          {/* Progress */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: "rgba(255,255,255,0.18)" }}>
              <div className="h-full rounded-full" style={{ width: `${lesson.progress}%`, background: "rgba(255,255,255,0.85)" }} />
            </div>
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600, whiteSpace: "nowrap" }}>
              {lesson.progress}٪
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>
              <CheckCircle size={13} />
              <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12 }}>
                {lesson.completedLessons}/{lesson.totalLessons} درس
              </span>
            </div>
          </div>
        </div>

        {/* Play button */}
        <div className="flex flex-col items-center gap-2 mr-6 flex-shrink-0">
          <ProgressRing pct={lesson.progress} size={56} stroke={4} />
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
  );
}
