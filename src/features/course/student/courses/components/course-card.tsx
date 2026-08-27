import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Play, Trophy, User } from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";
import { CourseUpdatedBadge } from "@/features/course/components/course-updated-badge";
import {
  FONT,
  PRIMARY,
  STATUS_CONFIG,
  SUCCESS,
  formatLessonsProgress,
  formatPercent,
} from "../formatters/courses.formatter";
import type { CourseView } from "../types/courses.types";

interface CourseCardProps {
  course: CourseView;
  index: number;
  onCourseClick?: (id: number) => void;
}

export function CourseCard({ course, index, onCourseClick }: CourseCardProps) {
  const [hovered, setHovered] = useState(false);
  const cfg = STATUS_CONFIG[course.status];
  const isCompleted = course.status === "completed";
  const isNotStarted = course.status === "not-started";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onCourseClick?.(course.id)}
      style={{
        borderRadius: 22,
        background: "#FFFFFF",
        border: `1.5px solid ${hovered ? "rgba(78,91,146,0.18)" : "#ECECEC"}`,
        boxShadow: hovered
          ? "0 16px 40px rgba(78,91,146,0.12), 0 4px 12px rgba(78,91,146,0.07)"
          : "0 2px 12px rgba(78,91,146,0.05)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.22s ease, border-color 0.22s ease, transform 0.22s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {/* ── Thumbnail ─────────────────────────────────────────────────── */}
      <div style={{ position: "relative", paddingTop: "56.25%", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transition: "transform 0.35s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        >
          <ImageWithFallback
            src={course.image}
            alt={course.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(10,13,38,0.04) 0%, rgba(10,13,38,0.52) 100%)",
          }}
        />

        {/*
          Progress state, and — when the instructor has changed the course since it was
          last published — the update notice beside it. `flex-wrap` and the `left` bound
          keep the pair inside the thumbnail on a narrow card instead of overflowing it.
        */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            left: 12,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            alignItems: "flex-start",
            gap: 6,
          }}
          dir="rtl"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px 4px 8px",
              borderRadius: 99,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.6)",
              flexShrink: 0,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
            <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: cfg.text, whiteSpace: "nowrap" }}>
              {cfg.label}
            </span>
          </div>

          {course.hasUpdatesSinceEnrollment && <CourseUpdatedBadge tone="solid" />}
        </div>

        {/* Completed checkmark overlay */}
        {isCompleted && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(34,197,94,0.85)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(255,255,255,0.5)",
              }}
            >
              <CheckCircle2 size={22} color="#fff" strokeWidth={2.5} />
            </div>
          </div>
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "18px 18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flex: 1,
        }}
        dir="rtl"
      >
        {/* Title & instructor */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <h3
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 15,
              color: "#1F2937",
              lineHeight: 1.5,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {course.title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <User size={11} color="#9BA3C4" strokeWidth={1.5} />
            <span style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>{course.instructor}</span>
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: FONT,
            fontSize: 12,
            color: "#6B7280",
            lineHeight: 1.75,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {course.description}
        </p>

        {/* Progress section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: "auto" }}>
          {/* Bar header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4" }}>
              {isNotStarted ? "لم تبدأ بعد" : formatLessonsProgress(course.completedLessons, course.totalLessons)}
            </span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 700,
                color: isCompleted ? "#15803D" : isNotStarted ? "#9BA3C4" : PRIMARY,
              }}
            >
              {formatPercent(course.progress)}
            </span>
          </div>

          {/* Progress track */}
          <div
            style={{
              width: "100%",
              height: 5,
              borderRadius: 99,
              background: isCompleted ? "rgba(34,197,94,0.15)" : "rgba(78,91,146,0.08)",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course.progress}%` }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.06, ease: "easeOut" }}
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

        {/* CTA Button */}
        <motion.button
          whileHover={hovered ? { scale: 1.015 } : {}}
          whileTap={{ scale: 0.98 }}
          style={{
            width: "100%",
            padding: "11px 16px",
            borderRadius: 14,
            background: isCompleted
              ? "rgba(34,197,94,0.08)"
              : isNotStarted
              ? "rgba(78,91,146,0.06)"
              : hovered
              ? `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`
              : "rgba(78,91,146,0.08)",
            color: isCompleted
              ? "#15803D"
              : isNotStarted
              ? "#6B7280"
              : hovered
              ? "#ffffff"
              : PRIMARY,
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            transition: "background 0.22s, color 0.22s",
            boxShadow: isCompleted || isNotStarted
              ? "none"
              : hovered
              ? "0 4px 16px rgba(78,91,146,0.25)"
              : "none",
          }}
          onClick={() => onCourseClick?.(course.id)}
        >
          {isCompleted ? (
            <>
              <Trophy size={14} strokeWidth={2} />
              عرض الدورة
            </>
          ) : isNotStarted ? (
            <>
              <Play size={13} fill="currentColor" strokeWidth={0} />
              ابدأ الآن
            </>
          ) : (
            <>
              <Play size={13} fill={hovered ? "#ffffff" : PRIMARY} strokeWidth={0} />
              استكمال التعلم
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
