import { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, ChevronLeft, DollarSign, PlayCircle, Clock3 } from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";
import type { Course } from "../types/home.types";
import { formatDuration } from "../formatters/home.formatter";
import { PRIMARY, FONT, TEXT_DARK, TEXT_MID, BORDER } from "./theme";

interface CourseCardProps {
  course: Course;
  delay?: number;
  onNavigate?: () => void;
}

export function CourseCard({ course, delay = 0, onNavigate }: CourseCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: 20,
        overflow: "hidden",
        border: `1.5px solid ${hovered ? "rgba(78,91,146,0.2)" : BORDER}`,
        boxShadow: hovered
          ? "0 10px 32px rgba(78,91,146,0.11)"
          : "0 2px 12px rgba(78,91,146,0.045)",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      <div
        className="flex items-stretch"
        dir="rtl"
        onClick={onNavigate}
        style={{ cursor: onNavigate ? "pointer" : "default" }}
      >
        {/* Thumbnail */}
        <div
          className="flex-shrink-0 relative overflow-hidden"
          style={{ width: 128, minHeight: 92 }}
        >
          {/* Placeholder while loading */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #EAECF5 0%, #DDE0F0 100%)",
              opacity: imgLoaded ? 0 : 1,
              transition: "opacity 0.3s",
            }}
          >
            <BookOpen size={22} style={{ color: "#C4C9DC" }} />
          </div>

          <ImageWithFallback
            src={course.image}
            alt={course.title}
            onLoad={() => setImgLoaded(true)}
            className="w-full h-full object-cover absolute inset-0"
            style={{
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.35s, transform 0.35s",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
          />

          {/* Subtle scrim */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to left, transparent 50%, rgba(26,31,60,0.3) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center px-5 py-4 gap-2">
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 15,
              color: TEXT_DARK,
              lineHeight: 1.4,
            }}
          >
            {course.title}
          </div>

          {/* Badges container */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Price badge */}
            <div
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1"
              style={{
                background:
                  course.price === 0
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(78,91,146,0.07)",
                border: `1px solid ${
                  course.price === 0
                    ? "rgba(34,197,94,0.18)"
                    : "rgba(78,91,146,0.12)"
                }`,
              }}
            >
              <DollarSign
                size={10}
                strokeWidth={2.2}
                style={{
                  color: course.price === 0 ? "#15803D" : PRIMARY,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 11,
                  fontWeight: 600,
                  color: course.price === 0 ? "#15803D" : PRIMARY,
                  direction: "ltr",
                }}
              >
                {course.price === 0 ? "مجانية" : course.price.toFixed(2)}
              </span>
            </div>

            {/* Lesson Count badge */}
            {course.lessonCount !== undefined && course.lessonCount > 0 && (
              <div
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                style={{
                  background: "rgba(107,112,138,0.06)",
                  border: "1px solid rgba(107,112,138,0.12)",
                }}
              >
                <PlayCircle size={10} style={{ color: TEXT_MID }} strokeWidth={2.2} />
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 600,
                    color: TEXT_MID,
                  }}
                >
                  {course.lessonCount} درس
                </span>
              </div>
            )}

            {/* Duration badge */}
            {course.duration !== undefined && course.duration > 0 && (
              <div
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                style={{
                  background: "rgba(107,112,138,0.06)",
                  border: "1px solid rgba(107,112,138,0.12)",
                }}
              >
                <Clock3 size={10} style={{ color: TEXT_MID }} strokeWidth={2.2} />
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 600,
                    color: TEXT_MID,
                  }}
                >
                  {formatDuration(course.duration)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hover arrow */}
        <div className="flex items-center pl-5 pr-3 flex-shrink-0">
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 5 }}
            transition={{ duration: 0.18 }}
          >
            <ChevronLeft size={18} style={{ color: PRIMARY }} strokeWidth={2} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
