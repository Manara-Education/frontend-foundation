import { useState } from "react";
import { motion } from "motion/react";
import { Play, Lock, Clock } from "lucide-react";
import { FONT } from "../formatters/course-details.formatter";
import type { Lesson } from "../types/course-details.types";

interface BrowseLessonItemProps {
  lesson: Lesson;
  index: number;
  enrolled: boolean;
}

export function BrowseLessonItem({ lesson, index, enrolled }: BrowseLessonItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: index * 0.03 }}
      onMouseEnter={() => enrolled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        borderRadius: 16,
        background: hovered ? "rgba(78,91,146,0.03)" : "#FFFFFF",
        border: `1.5px solid ${hovered ? "rgba(78,91,146,0.12)" : "#ECECEC"}`,
        cursor: enrolled ? "pointer" : "default",
        transition: "all 0.18s ease",
        opacity: enrolled ? 1 : 0.75,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 9,
          background: enrolled ? "rgba(34,197,94,0.08)" : "rgba(196,201,222,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: enrolled ? "#15803D" : "#C4C9DE",
        }}
      >
        {enrolled ? <Play size={13} fill="#15803D" strokeWidth={0} /> : <Lock size={13} strokeWidth={2} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: enrolled ? "#1F2937" : "#9BA3C4",
            lineHeight: 1.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {lesson.title}
        </div>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 10,
            padding: "1px 7px",
            borderRadius: 99,
            background: enrolled ? "rgba(34,197,94,0.08)" : "rgba(196,201,222,0.10)",
            color: enrolled ? "#15803D" : "#C4C9DE",
            marginTop: 3,
            display: "inline-block",
          }}
        >
          {enrolled ? "متاح" : "مقفل"}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#C4C9DE", flexShrink: 0 }}>
        <Clock size={11} strokeWidth={1.5} />
        <span style={{ fontFamily: FONT, fontSize: 11, color: "#B0B7D4" }}>{lesson.duration}</span>
      </div>
    </motion.div>
  );
}
