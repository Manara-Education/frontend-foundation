import { motion } from "motion/react";
import { GraduationCap } from "lucide-react";
import type { CourseDetailData } from "../types/course-details.types";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

export function InstructorSection({ course }: { course: CourseDetailData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.4 }}
      style={{
        borderRadius: 20,
        background: "#FFFFFF",
        border: "1.5px solid #ECECEC",
        padding: "22px 24px",
        boxShadow: "0 2px 12px rgba(78,91,146,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
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
          <GraduationCap size={14} strokeWidth={1.8} />
        </div>
        <span style={{ fontFamily: FONT, fontSize: 15, color: "#1F2937" }}>المدرّس</span>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            flexShrink: 0,
            border: "2px solid rgba(78,91,146,0.12)",
            background: "linear-gradient(135deg, #3A4880 0%, #6B7AB8 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 24,
          }}
          aria-label={course.instructor}
        >
          {course.instructor?.trim().charAt(0) ?? ""}
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontFamily: FONT, fontSize: 16, color: "#1F2937", marginBottom: 2 }}>
            {course.instructor}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", marginBottom: 10 }}>
            {course.instructorTitle}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "14px 16px",
          borderRadius: 14,
          background: "rgba(78,91,146,0.03)",
          border: "1px solid rgba(78,91,146,0.07)",
        }}
      >
        <p
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: "#6B7280",
            lineHeight: 1.85,
            margin: 0,
          }}
        >
          {course.instructorBio}
        </p>
      </div>
    </motion.div>
  );
}
