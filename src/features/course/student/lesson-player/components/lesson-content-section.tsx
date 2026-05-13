import { BookOpen, Lightbulb } from "lucide-react";
import { motion } from "motion/react";
import type { LessonContent } from "../types/lesson-player.types";
import { FONT, PRIMARY } from "./lesson-player.constants";

interface LessonContentSectionProps {
  content: LessonContent;
}

export function LessonContentSection({ content }: LessonContentSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      style={{
        borderRadius: 20,
        background: "#FFFFFF",
        border: "1.5px solid #ECECEC",
        padding: "22px 24px",
        marginBottom: 16,
        boxShadow: "0 2px 12px rgba(78,91,146,0.04)",
      }}
    >
      {/* Description */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
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
            <BookOpen size={14} strokeWidth={1.8} />
          </div>
          <span style={{ fontFamily: FONT, fontSize: 15, color: "#1F2937" }}>نبذة عن الدرس</span>
        </div>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 14,
            color: "#6B7280",
            lineHeight: 1.95,
            margin: 0,
          }}
        >
          {content.description}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#F4F4F4", marginBottom: 24 }} />

      {/* Key Points */}


      {/* Divider */}


      {/* Summary */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background: "rgba(245,158,11,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F59E0B",
              flexShrink: 0,
            }}
          >
            <Lightbulb size={14} strokeWidth={1.8} />
          </div>
          <span style={{ fontFamily: FONT, fontSize: 15, color: "#1F2937" }}>ملخص الدرس</span>
        </div>
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 14,
            background: "rgba(78,91,146,0.03)",
            border: "1px solid rgba(78,91,146,0.08)",
          }}
        >
          <p
            style={{
              fontFamily: FONT,
              fontSize: 13,
              color: "#6B7280",
              lineHeight: 1.9,
              margin: 0,
            }}
          >
            {content.summary}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
