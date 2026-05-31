import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/course-details.formatter";
import type { CourseDetailData } from "../types/course-details.types";

export function DescriptionSection({ course }: { course: CourseDetailData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.32 }}
      style={{
        borderRadius: 20,
        background: "#FFFFFF",
        border: "1.5px solid #ECECEC",
        padding: "22px 24px",
        marginBottom: 20,
        boxShadow: "0 2px 12px rgba(78,91,146,0.04)",
      }}
    >
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 9,
              background: "rgba(78,91,146,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PRIMARY,
            }}
          >
            <BookOpen size={13} strokeWidth={1.8} />
          </div>
          <span style={{ fontFamily: FONT, fontSize: 15, color: "#1F2937" }}>عن الدورة</span>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 14, color: "#6B7280", lineHeight: 1.85, margin: 0 }}>
          {course.description}
        </p>
      </div>
    </motion.div>
  );
}
