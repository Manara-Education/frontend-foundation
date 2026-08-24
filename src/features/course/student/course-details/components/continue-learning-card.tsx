import { useState } from "react";
import { motion } from "motion/react";
import { Play, Clock, ArrowRight, Trophy } from "lucide-react";
import { FONT, PRIMARY, SUCCESS } from "../formatters/course-details.formatter";
import type { CourseDetailData } from "../types/course-details.types";

interface ContinueLearningCardProps {
  course: CourseDetailData;
  onLessonClick?: (id: number) => void;
}

export function ContinueLearningCard({ course, onLessonClick }: ContinueLearningCardProps) {
  const [hovered, setHovered] = useState(false);
  const isCompleted = course.progress === 100;
  const currentLesson = course.lessons.find((l) => l.status === "current");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20,
        background: isCompleted
          ? "linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(34,197,94,0.02) 100%)"
          : `linear-gradient(135deg, rgba(78,91,146,0.06) 0%, rgba(78,91,146,0.02) 100%)`,
        border: `1.5px solid ${isCompleted ? "rgba(34,197,94,0.18)" : "rgba(78,91,146,0.12)"}`,
        padding: "20px 22px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 18,
        boxShadow: hovered ? "0 8px 28px rgba(78,91,146,0.10)" : "none",
        transition: "box-shadow 0.22s, transform 0.22s",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        cursor: "pointer",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: isCompleted
            ? "rgba(34,197,94,0.12)"
            : `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: isCompleted ? "none" : "0 4px 12px rgba(78,91,146,0.25)",
        }}
      >
        {isCompleted ? (
          <Trophy size={22} color={SUCCESS} strokeWidth={1.8} />
        ) : (
          <Play size={20} fill="#ffffff" color="#ffffff" strokeWidth={0} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4", marginBottom: 3 }}>
          {isCompleted ? "اكتملت الدورة" : "الدرس الحالي"}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 15, color: "#1F2937", lineHeight: 1.45, marginBottom: 4 }}>
          {isCompleted
            ? "أنجزت جميع الدروس بنجاح!"
            : `الدرس ${course.currentLesson.number}: ${course.currentLesson.title}`}
        </div>
        {!isCompleted && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9BA3C4" }}>
            <Clock size={11} strokeWidth={1.5} />
            <span style={{ fontFamily: FONT, fontSize: 11 }}>{course.currentLesson.remaining} متبقية</span>
          </div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          const target = currentLesson ?? course.lessons[0];
          if (target) onLessonClick?.(target.id);
        }}
        style={{
          padding: "9px 20px",
          borderRadius: 12,
          background: isCompleted ? "rgba(34,197,94,0.10)" : PRIMARY,
          color: isCompleted ? "#15803D" : "#ffffff",
          border: "none",
          cursor: "pointer",
          fontFamily: FONT,
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
          boxShadow: isCompleted ? "none" : "0 3px 12px rgba(78,91,146,0.22)",
        }}
      >
        {isCompleted ? "مراجعة" : "متابعة التعلم"}
        <ArrowRight size={13} strokeWidth={2} style={{ transform: "rotate(180deg)" }} />
      </motion.button>
    </motion.div>
  );
}
