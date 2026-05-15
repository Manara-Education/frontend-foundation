import { motion } from "motion/react";
import { Play, Clock, BookOpen, Users, Trophy } from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";
import type { CourseDetailData } from "../types/course-details.types";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";
const SUCCESS = "#22C55E";

export function HeroSection({ course }: { course: CourseDetailData }) {
  const isCompleted = course.progress === 100;
  const isNotStarted = course.progress === 0;

  return (
    <div
      style={{
        borderRadius: 24,
        overflow: "hidden",
        background: "#FFFFFF",
        border: "1.5px solid #ECECEC",
        boxShadow: "0 4px 24px rgba(78,91,146,0.08)",
        marginBottom: 20,
      }}
    >
      <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
        <ImageWithFallback
          src={course.image}
          alt={course.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(10,13,40,0.1) 0%, rgba(10,13,40,0.78) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            left: 0,
            padding: "24px 24px 20px",
          }}
        >
          <h1
            style={{
              fontFamily: FONT,
              fontSize: 24,
              color: "#FFFFFF",
              lineHeight: 1.45,
              margin: "0 0 10px",
            }}
          >
            {course.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4E5B92 0%, #6B7AB8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {course.instructor.charAt(course.instructor.length - 1)}
              </div>
              <span style={{ fontFamily: FONT, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                {course.instructor}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.7)" }}>
              <Users size={13} strokeWidth={1.5} />
              <span style={{ fontFamily: FONT, fontSize: 12 }}>{course.students.toLocaleString("ar-EG")} طالب</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.7)" }}>
              <BookOpen size={13} strokeWidth={1.5} />
              <span style={{ fontFamily: FONT, fontSize: 12 }}>{course.totalLessons} درس</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.7)" }}>
              <Clock size={13} strokeWidth={1.5} />
              <span style={{ fontFamily: FONT, fontSize: 12 }}>{course.totalDuration}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>
              {isCompleted
                ? "أتممت الدورة بنجاح 🎉"
                : isNotStarted
                ? "لم تبدأ بعد"
                : `${course.completedLessons} من ${course.totalLessons} درس مكتمل`}
            </span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: isCompleted ? "#15803D" : isNotStarted ? "#9BA3C4" : PRIMARY,
              }}
            >
              {course.progress}٪
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 6,
              borderRadius: 99,
              background: isCompleted ? "rgba(34,197,94,0.12)" : "rgba(78,91,146,0.08)",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course.progress}%` }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              style={{
                height: "100%",
                borderRadius: 99,
                background: isCompleted
                  ? `linear-gradient(90deg, ${SUCCESS} 0%, #4ADE80 100%)`
                  : `linear-gradient(90deg, ${PRIMARY} 0%, #7080B8 100%)`,
              }}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: "11px 24px",
            borderRadius: 14,
            background: isCompleted
              ? "rgba(34,197,94,0.08)"
              : `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`,
            color: isCompleted ? "#15803D" : "#ffffff",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
            boxShadow: isCompleted ? "none" : "0 4px 18px rgba(78,91,146,0.3)",
          }}
        >
          {isCompleted ? <Trophy size={15} strokeWidth={2} /> : <Play size={14} fill="#fff" strokeWidth={0} />}
          {isCompleted ? "مراجعة الدورة" : isNotStarted ? "ابدأ التعلم الآن" : "استكمال التعلم"}
        </motion.button>
      </div>
    </div>
  );
}
