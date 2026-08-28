import { useState } from "react";
import { motion } from "motion/react";
import { Clock, FileText } from "lucide-react";
import { CourseUpdatedBadge } from "@/features/course/components/course-updated-badge";
import { FONT, LESSON_STATUS_CONFIG, PRIMARY, louderChange } from "../formatters/course-details.formatter";
import type { Lesson } from "../types/course-details.types";

interface LessonItemProps {
  lesson: Lesson;
  index: number;
  onLessonClick?: (id: number) => void;
}

export function LessonItem({ lesson, index, onLessonClick }: LessonItemProps) {
  const [hovered, setHovered] = useState(false);
  const cfg = LESSON_STATUS_CONFIG[lesson.status];
  const Icon = cfg.icon;
  const isLocked = lesson.status === "locked";
  const isCurrent = lesson.status === "current";
  // One badge per row, not two. A lesson and its quiz each carry a verdict, and a dense
  // list is not the place to print both — the louder one wins and brings its own wording,
  // so a row lit by its quiz says so rather than claiming the video moved.
  const change = louderChange(lesson.change, lesson.quizChange);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: index * 0.035 }}
      onMouseEnter={() => !isLocked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (!isLocked) onLessonClick?.(lesson.id);
      }}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 2,
            // Wraps rather than pushing the duration off the row: on a narrow screen the
            // status pill and the change badge do not both fit on one line.
            flexWrap: "wrap",
          }}
        >
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
          {/* Shown on locked rows too. "This lesson is new since you enrolled" is a fact
              about the listing, not about the content behind it, and hiding it would
              withhold the very thing the badge exists to point at. */}
          <CourseUpdatedBadge state={change.state} summary={change.summary} />
        </div>
      </div>

      {/*
        A running time, for the lessons that have one.

        A rich-content lesson is read rather than played, so it has no duration and gets a reading
        marker instead of "0s". Printing a zero would be a video assumption surviving in the
        curriculum — the row would claim the lesson is empty when it is an article.
      */}
      {lesson.contentType === "RICH_CONTENT" ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#C4C9DE", flexShrink: 0 }}>
          <FileText size={11} strokeWidth={1.5} />
          <span style={{ fontFamily: FONT, fontSize: 11, color: "#B0B7D4" }}>مقروء</span>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#C4C9DE", flexShrink: 0 }}>
          <Clock size={11} strokeWidth={1.5} />
          <span style={{ fontFamily: FONT, fontSize: 11, color: "#B0B7D4" }}>{lesson.duration}</span>
        </div>
      )}

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
