import { useState } from "react";
import { motion } from "motion/react";
import { Play, CheckCircle2, Lock, Clock, PlayCircle } from "lucide-react";
import type { LessonStatus, LessonView } from "../types/course-details.types";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";
const SUCCESS = "#22C55E";

const LESSON_CFG: Record<LessonStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  completed:     { icon: CheckCircle2, color: SUCCESS,   bg: "rgba(34,197,94,0.10)",   label: "مكتمل" },
  current:       { icon: PlayCircle,   color: PRIMARY,   bg: "rgba(78,91,146,0.10)",   label: "قيد المشاهدة" },
  "not-started": { icon: Play,         color: "#9BA3C4", bg: "rgba(155,163,196,0.08)", label: "غير مكتمل" },
  locked:        { icon: Lock,         color: "#C4C9DE", bg: "rgba(196,201,222,0.06)", label: "مقفل" },
};

interface LessonItemProps {
  lesson: LessonView;
  index: number;
  onLessonClick?: (id: number) => void;
}

export function LessonItem({ lesson, index, onLessonClick }: LessonItemProps) {
  const [hovered, setHovered] = useState(false);
  const cfg = LESSON_CFG[lesson.status];
  const Icon = cfg.icon;
  const isLocked = lesson.status === "locked";
  const isCurrent = lesson.status === "current";

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: index * 0.035 }}
      onMouseEnter={() => !isLocked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (!isLocked) onLessonClick?.(lesson.id); }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        borderRadius: 16,
        background: isCurrent
          ? "rgba(78,91,146,0.05)"
          : hovered
          ? "rgba(78,91,146,0.03)"
          : "#FFFFFF",
        border: `1.5px solid ${isCurrent ? "rgba(78,91,146,0.18)" : hovered && !isLocked ? "rgba(78,91,146,0.12)" : "#ECECEC"}`,
        cursor: isLocked ? "not-allowed" : "pointer",
        transition: "all 0.18s ease",
        boxShadow: isCurrent ? "0 2px 16px rgba(78,91,146,0.08)" : hovered && !isLocked ? "0 4px 16px rgba(78,91,146,0.06)" : "none",
        opacity: isLocked ? 0.6 : 1,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 9,
          background: isCurrent ? `rgba(78,91,146,0.12)` : cfg.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: isCurrent ? PRIMARY : cfg.color,
        }}
      >
        {lesson.status === "completed" || isCurrent || isLocked ? (
          <Icon size={14} strokeWidth={2} />
        ) : (
          <span style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4" }}>{lesson.number}</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: isLocked ? "#C4C9DE" : isCurrent ? PRIMARY : "#1F2937",
            lineHeight: 1.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {lesson.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
          <span
            style={{
              fontFamily: FONT,
              fontSize: 10,
              padding: "1px 7px",
              borderRadius: 99,
              background: cfg.bg,
              color: cfg.color,
            }}
          >
            {cfg.label}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#C4C9DE", flexShrink: 0 }}>
        <Clock size={11} strokeWidth={1.5} />
        <span style={{ fontFamily: FONT, fontSize: 11, color: "#B0B7D4" }}>{lesson.duration}</span>
      </div>

      {isCurrent && (
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: PRIMARY,
            boxShadow: `0 0 0 3px rgba(78,91,146,0.18)`,
            flexShrink: 0,
          }}
        />
      )}
    </motion.div>
  );
}
