import { motion } from "motion/react";
import { Clock, BookOpen, Users, Trophy, BarChart3 } from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";
import { CourseUpdatedBadge } from "@/features/course/components/course-updated-badge";
import { FONT, PRIMARY, SUCCESS, formatStudentsCount } from "../formatters/course-details.formatter";
import type { CourseDetailData } from "../types/course-details.types";

export function HeroSection({ course }: { course: CourseDetailData }) {
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
          {/* The reader's own answer, not the instructor's. Somebody who enrolled after
              the last edit bought the version that already contained it, and is shown no
              badge at all. */}
          {course.hasUpdatesSinceEnrollment && (
            <div style={{ marginBottom: 10 }}>
              <CourseUpdatedBadge tone="solid" />
            </div>
          )}
          <h1
            style={{
              fontFamily: FONT,
              fontSize: 24,
              color: "#FFFFFF",
              lineHeight: 1.45,
              margin: "0 0 10px",
              // A long title wraps rather than pushing the badge above it off the hero.
              overflowWrap: "anywhere",
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
                {course.instructor?.trim().charAt(0) ?? ""}
              </div>
              <span style={{ fontFamily: FONT, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                {course.instructor}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.7)" }}>
              <Users size={13} strokeWidth={1.5} />
              <span style={{ fontFamily: FONT, fontSize: 12 }}>{formatStudentsCount(course.students)} طالب</span>
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

      {course.progress > 0 && (
        <div style={{ padding: "14px 22px 16px", borderTop: "1px solid rgba(78,91,146,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {course.progress === 100 ? (
                <Trophy size={13} color={SUCCESS} strokeWidth={1.8} />
              ) : (
                <BarChart3 size={13} color={PRIMARY} strokeWidth={1.8} />
              )}
              <span style={{ fontFamily: FONT, fontSize: 12, color: course.progress === 100 ? "#15803D" : PRIMARY }}>
                {course.progress === 100 ? "أتممت الدورة بنجاح 🎉" : "تقدمك في الدورة"}
              </span>
            </div>
            <span style={{ fontFamily: FONT, fontSize: 12, color: "#6B7280" }}>
              {course.completedLessons} / {course.totalLessons} درس
              <span style={{ marginRight: 6, fontWeight: 700, color: course.progress === 100 ? "#15803D" : PRIMARY }}>
                {course.progress}٪
              </span>
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 6, background: "rgba(78,91,146,0.08)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course.progress}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              style={{
                height: "100%",
                borderRadius: 6,
                background: course.progress === 100
                  ? "linear-gradient(90deg, #22C55E 0%, #16A34A 100%)"
                  : `linear-gradient(90deg, ${PRIMARY} 0%, #6B7AB8 100%)`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
