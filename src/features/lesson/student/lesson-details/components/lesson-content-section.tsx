import { BookOpen } from "lucide-react";
import { motion } from "motion/react";
import { FONT, PRIMARY } from "./lesson.constants";

interface LessonContentSectionProps {
  description: string;
}

export function LessonContentSection({ description }: LessonContentSectionProps) {
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
          {description}
        </p>
      </div>
    </motion.div>
  );
}
