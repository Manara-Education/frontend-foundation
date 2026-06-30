import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import type { LessonRef } from "../types/lesson.types";
import { FONT, PRIMARY } from "./lesson.constants";

interface LessonNavigationProps {
  prevLesson: LessonRef | null;
  nextLesson: LessonRef | null;
  onNavigate: (lessonId: number) => void;
}

export function LessonNavigation({
  prevLesson,
  nextLesson,
  onNavigate,
}: LessonNavigationProps) {
  if (!prevLesson && !nextLesson) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.22 }}
      style={{
        display: "flex",
        gap: 12,
        marginTop: 16,
        marginBottom: 24,
        flexWrap: "wrap",
      }}
    >
      {prevLesson ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate(prevLesson.id)}
          style={{
            flex: 1,
            minWidth: 180,
            padding: "16px 20px",
            borderRadius: 18,
            background: "#FFFFFF",
            border: "1.5px solid #ECECEC",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            textAlign: "left",
            boxShadow: "0 2px 12px rgba(78,91,146,0.05)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "rgba(78,91,146,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ArrowRight size={16} color={PRIMARY} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT, fontSize: 10, color: "#B0B7D4", marginBottom: 3 }}>
              الدرس السابق
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: "#1F2937",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {prevLesson.title}
            </div>
          </div>
        </motion.button>
      ) : null}

      {nextLesson ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate(nextLesson.id)}
          style={{
            flex: 1,
            minWidth: 180,
            padding: "16px 20px",
            borderRadius: 18,
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            textAlign: "right",
            boxShadow: "0 6px 24px rgba(78,91,146,0.22)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 10,
                color: "rgba(255,255,255,0.65)",
                marginBottom: 3,
              }}
            >
              الدرس التالي
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {nextLesson.title}
            </div>
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} color="#fff" strokeWidth={2} />
          </div>
        </motion.button>
      ) : null}
    </motion.div>
  );
}
