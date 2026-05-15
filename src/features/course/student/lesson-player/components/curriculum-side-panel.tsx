import {
  BarChart3,
  CheckCircle2,
  Clock,
  List,
  Lock,
  Play,
  PlayCircle,
} from "lucide-react";
import { motion } from "motion/react";
import type { ElementType } from "react";
import { useEffect, useRef } from "react";
import type { LessonStatus, LessonView } from "../types/lesson-player.types";
import { FONT, PRIMARY, SUCCESS } from "./lesson-player.constants";

const STATUS_CFG: Record<LessonStatus, { icon: ElementType; color: string; bg: string }> = {
  completed: { icon: CheckCircle2, color: SUCCESS, bg: "rgba(34,197,94,0.10)" },
  current: { icon: PlayCircle, color: PRIMARY, bg: "rgba(78,91,146,0.12)" },
  "not-started": { icon: Play, color: "#9BA3C4", bg: "rgba(155,163,196,0.08)" },
  locked: { icon: Lock, color: "#C4C9DE", bg: "rgba(196,201,222,0.06)" },
};

interface CurriculumSidePanelProps {
  lessons: LessonView[];
  currentLessonId: number;
  onLessonSelect: (id: number) => void;
}

export function CurriculumSidePanel({
  lessons,
  currentLessonId,
  onLessonSelect,
}: CurriculumSidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const completedCount = lessons.filter((l) => l.status === "completed").length;

  // Scroll current lesson into view
  useEffect(() => {
    if (panelRef.current) {
      const activeEl = panelRef.current.querySelector("[data-active='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [currentLessonId]);

  const miniProgress = lessons.length
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{
        borderRadius: 20,
        background: "#FFFFFF",
        border: "1.5px solid #ECECEC",
        boxShadow: "0 4px 24px rgba(78,91,146,0.07)",
        overflow: "hidden",
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: "18px 18px 14px",
          borderBottom: "1px solid rgba(78,91,146,0.07)",
          background:
            "linear-gradient(135deg, rgba(78,91,146,0.03) 0%, rgba(78,91,146,0.01) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background: "rgba(78,91,146,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PRIMARY,
              flexShrink: 0,
            }}
          >
            <List size={14} strokeWidth={1.8} />
          </div>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 14, color: "#1F2937" }}>منهج الدورة</div>
            <div style={{ fontFamily: FONT, fontSize: 10, color: "#9BA3C4" }}>
              {lessons.length} درس
            </div>
          </div>
          {/* Stats */}
          <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <BarChart3 size={12} color={PRIMARY} strokeWidth={1.8} />
            <span style={{ fontFamily: FONT, fontSize: 11, color: PRIMARY }}>
              {completedCount}/{lessons.length}
            </span>
          </div>
        </div>

        {/* Mini progress bar */}
        <div
          style={{
            width: "100%",
            height: 4,
            borderRadius: 99,
            background: "rgba(78,91,146,0.08)",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${miniProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              height: "100%",
              borderRadius: 99,
              background: `linear-gradient(90deg, ${PRIMARY} 0%, #7080B8 100%)`,
            }}
          />
        </div>
      </div>

      {/* Lessons list */}
      <div
        ref={panelRef}
        style={{
          padding: "10px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {lessons.map((lesson, idx) => {
          const isActive = lesson.id === currentLessonId;
          const isLocked = lesson.status === "locked";
          const cfg = STATUS_CFG[lesson.status];
          const Icon = cfg.icon;

          return (
            <motion.button
              key={lesson.id}
              data-active={isActive ? "true" : "false"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: idx * 0.025 }}
              onClick={() => !isLocked && onLessonSelect(lesson.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 10px",
                borderRadius: 14,
                background: isActive ? "rgba(78,91,146,0.08)" : "transparent",
                border: `1.5px solid ${isActive ? "rgba(78,91,146,0.16)" : "transparent"}`,
                cursor: isLocked ? "not-allowed" : "pointer",
                textAlign: "right",
                transition: "all 0.16s ease",
                outline: "none",
                opacity: isLocked ? 0.55 : 1,
                boxShadow: isActive ? "0 2px 12px rgba(78,91,146,0.08)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isLocked) {
                  e.currentTarget.style.background = "rgba(78,91,146,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !isLocked) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {/* Status icon */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: cfg.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: cfg.color,
                }}
              >
                <Icon size={12} strokeWidth={2} />
              </div>

              {/* Title + duration */}
              <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 12,
                    color: isActive ? PRIMARY : isLocked ? "#C4C9DE" : "#374151",
                    lineHeight: 1.4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {lesson.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                  <Clock size={9} strokeWidth={1.5} color="#B0B7D4" />
                  <span style={{ fontFamily: FONT, fontSize: 10, color: "#B0B7D4" }}>
                    {lesson.duration}
                  </span>
                </div>
              </div>

              {/* Active indicator dot */}
              {isActive && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: PRIMARY,
                    boxShadow: `0 0 0 2.5px rgba(78,91,146,0.18)`,
                    flexShrink: 0,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
