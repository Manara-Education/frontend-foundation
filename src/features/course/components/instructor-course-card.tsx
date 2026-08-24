/**
 * The instructor's course row — one card per course, shared by every instructor surface
 * that lists courses: "دوراتي" (My Courses) and the home page's "دوراتي الأخيرة".
 *
 * It sits at the course feature's root rather than inside either list so the two stay one
 * design instead of drifting into two near-identical cards, which is what they were before.
 */
import { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, Calendar, CreditCard, RefreshCw, Users } from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";
import type { CourseCardModel } from "@/shared/courses";
import { formatPrice, formatUpdatedAt } from "../formatters/instructor-course-card.formatter";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";
const TEXT_DARK = "#1A1F3C";
const TEXT_MUTE = "#A8ADCA";
const BORDER = "rgba(78,91,146,0.09)";

/** The two neutral count badges — students and lessons — share one shell. */
const COUNT_BADGE = {
  background: "rgba(78,91,146,0.04)",
  border: "1px solid rgba(78,91,146,0.09)",
} as const;

/** The two priced access types share the stronger primary tint. */
const PRICED_BADGE = {
  background: "rgba(78,91,146,0.07)",
  border: "1px solid rgba(78,91,146,0.14)",
} as const;

/** A free course carries nothing but the word, so its badge sits a shade lighter. */
const FREE_BADGE = {
  background: "rgba(78,91,146,0.06)",
  border: "1px solid rgba(78,91,146,0.12)",
} as const;

interface InstructorCourseCardProps {
  course: CourseCardModel;
  delay?: number;
  onNavigate?: () => void;
}

export function InstructorCourseCard({ course, delay = 0, onNavigate }: InstructorCourseCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const isPublished = course.status === "PUBLISHED";

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
        <div className="flex-shrink-0 relative overflow-hidden" style={{ width: 128, minHeight: 92 }}>
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

          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to left, transparent 50%, rgba(26,31,60,0.3) 100%)" }}
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

          <div
            className="flex items-center gap-1.5"
            style={{ fontFamily: FONT, fontSize: 12, color: TEXT_MUTE }}
          >
            <Calendar size={11} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            آخر تحديث: {formatUpdatedAt(course.updatedAt ?? course.createdAt)}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Publication state — the segment the filter pills narrow the list by. */}
            <div
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1"
              style={
                isPublished
                  ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)" }
                  : { background: "rgba(234,156,26,0.08)", border: "1px solid rgba(234,156,26,0.25)" }
              }
            >
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 11,
                  fontWeight: 600,
                  color: isPublished ? "#15803D" : "#A16207",
                }}
              >
                {isPublished ? "منشورة" : "مسودة"}
              </span>
            </div>

            {/*
              How the course is sold. The three types are mutually exclusive, and each
              names itself rather than leaving a bare number to be read as a price.
            */}
            {course.accessType === "FREE" && (
              <div className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1" style={FREE_BADGE}>
                <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: PRIMARY }}>
                  مجاني
                </span>
              </div>
            )}

            {course.accessType === "PURCHASE" && (
              <div className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1" style={PRICED_BADGE}>
                <CreditCard size={10} strokeWidth={2.2} style={{ color: PRIMARY, flexShrink: 0 }} />
                <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: PRIMARY }}>
                  {formatPrice(course.purchasePrice ?? course.price)} ج.م
                </span>
              </div>
            )}

            {course.accessType === "SUBSCRIPTION" && (
              <div className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1" style={PRICED_BADGE}>
                <RefreshCw size={10} strokeWidth={2.2} style={{ color: PRIMARY, flexShrink: 0 }} />
                <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: PRIMARY }}>
                  {/*
                    The list payload does not always inline the plans. Without one the badge
                    still says the course is a subscription and leaves the price unstated.
                  */}
                  {course.subscriptionMinPrice === undefined
                    ? "اشتراك"
                    : `اشتراك يبدأ من ${formatPrice(course.subscriptionMinPrice)} ج.م`}
                </span>
              </div>
            )}

            <div className="inline-flex items-center gap-1 rounded-lg px-2 py-1" style={COUNT_BADGE}>
              <Users size={10} strokeWidth={2.2} style={{ color: TEXT_MUTE, flexShrink: 0 }} />
              <span style={{ fontFamily: FONT, fontSize: 11, color: TEXT_MUTE }}>
                {course.studentsCount ?? 0} طالب
              </span>
            </div>

            <div className="inline-flex items-center gap-1 rounded-lg px-2 py-1" style={COUNT_BADGE}>
              <BookOpen size={10} strokeWidth={2.2} style={{ color: TEXT_MUTE, flexShrink: 0 }} />
              <span style={{ fontFamily: FONT, fontSize: 11, color: TEXT_MUTE }}>
                {course.lessonCount ?? 0} درس
              </span>
            </div>
          </div>
        </div>

        {/* Hover arrow */}
        <div className="flex items-center pl-5 pr-3 flex-shrink-0">
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 5 }}
            transition={{ duration: 0.18 }}
          >
            <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
              <path
                d="M10 14L5 9L10 4"
                stroke={PRIMARY}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
