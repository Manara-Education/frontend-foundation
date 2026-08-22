/**
 * One course in the "استكشاف الدورات" grid — a vertical tile: 16:9 cover, instructor,
 * title, description, the lessons/duration/students meta row, and an access-aware price
 * badge beside an explicit call to action.
 *
 * The badge and the CTA branch on `accessType` and enrolment, never on the price. A
 * subscription course carries no `purchasePrice` either, so reading "free" off a null
 * would give a paid course away.
 */
import { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, Clock, Users } from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";
import type { CourseExploreView } from "../types/explore.types";
import {
  BORDER,
  BORDER_HOVER,
  FONT,
  ICON_MUTE,
  PRIMARY,
  PRIMARY_SOFT,
  TEXT_BODY,
  TEXT_DARK,
  TEXT_MUTE,
  formatDuration,
  formatPrice,
  formatStudentsCount,
} from "../formatters/explore.formatter";

/** The reference's card easing — a soft overshoot-free settle. */
const EASE = [0.22, 1, 0.36, 1] as const;

interface ExploreCourseCardProps {
  course: CourseExploreView;
  /** Position in the grid; the entry animation staggers off it. */
  index?: number;
  onNavigate?: () => void;
  isEnrolled?: boolean;
}

/** What the badge and the button say, decided by access type and enrolment. */
function accessLabels(course: CourseExploreView, isEnrolled: boolean) {
  if (isEnrolled) {
    return { badge: "مشترك", isFree: false, cta: "عرض الدورة" };
  }

  switch (course.accessType) {
    case "FREE":
      return { badge: "مجانية", isFree: true, cta: "ابدأ مجاناً" };
    case "SUBSCRIPTION":
      return { badge: "اشتراك", isFree: false, cta: "اشترك الآن" };
    case "PURCHASE":
    default:
      return {
        // A `PURCHASE` course with no amount is a payload the card cannot price, so it
        // states the access type rather than inventing a `0 ج.م`.
        badge: course.purchasePrice !== null ? formatPrice(course.purchasePrice) : "شراء",
        isFree: false,
        cta: "شراء الآن",
      };
  }
}

function AccessBadge({ label, isFree }: { label: string; isFree: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 99,
        background: isFree ? "rgba(34,197,94,0.10)" : "rgba(78,91,146,0.10)",
        border: `1px solid ${isFree ? "rgba(34,197,94,0.22)" : "rgba(78,91,146,0.20)"}`,
        color: isFree ? "#15803D" : PRIMARY,
        fontFamily: FONT,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
}

export function ExploreCourseCard({
  course,
  index = 0,
  onNavigate,
  isEnrolled = false,
}: ExploreCourseCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const { badge, isFree, cta } = accessLabels(course, isEnrolled);
  const duration = formatDuration(course.duration);
  const instructorInitial = course.instructorName.trim().charAt(0);

  const meta = [
    course.lessonCount > 0 && { icon: BookOpen, label: `${course.lessonCount} درس` },
    duration && { icon: Clock, label: duration },
    course.studentsCount > 0 && {
      icon: Users,
      label: `${formatStudentsCount(course.studentsCount)} طالب`,
    },
  ].filter(Boolean) as { icon: typeof BookOpen; label: string }[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.055, ease: EASE }}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onNavigate}
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 22,
        background: "#FFFFFF",
        border: `1.5px solid ${hovered ? BORDER_HOVER : BORDER}`,
        boxShadow: hovered
          ? "0 18px 44px rgba(78,91,146,0.13), 0 4px 12px rgba(78,91,146,0.07)"
          : "0 2px 14px rgba(78,91,146,0.05)",
        overflow: "hidden",
        cursor: onNavigate ? "pointer" : "default",
        transition: "box-shadow 0.24s ease, border-color 0.24s ease",
      }}
    >
      {/* Cover — 16:9, held by the padding ratio so it scales with the column */}
      <div style={{ position: "relative", paddingTop: "56.25%", overflow: "hidden" }}>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #EAECF5 0%, #DDE0F0 100%)",
            opacity: imgLoaded ? 0 : 1,
            transition: "opacity 0.3s",
          }}
        >
          <BookOpen size={26} style={{ color: "#C4C9DC" }} />
        </div>

        <div
          className="absolute inset-0"
          style={{
            transition: "transform 0.38s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
        >
          <ImageWithFallback
            src={course.image}
            alt={course.title}
            onLoad={() => setImgLoaded(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.35s",
            }}
          />
        </div>

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,13,38,0.04) 0%, rgba(10,13,38,0.45) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 11,
          padding: "18px 18px 20px",
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Instructor — its own row now, no longer folded into the subtitle */}
        {course.instructorName && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_SOFT} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT,
                fontSize: 9,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {instructorInitial}
            </div>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 12,
                color: TEXT_MUTE,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {course.instructorName}
            </span>
          </div>
        )}

        {/* Title — two lines, then clamped */}
        <h3
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 15,
            color: TEXT_DARK,
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

        {course.description && (
          <p
            style={{
              fontFamily: FONT,
              fontSize: 12,
              color: TEXT_BODY,
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
        )}

        {meta.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            {meta.map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon size={11} color={ICON_MUTE} strokeWidth={1.5} />
                <span style={{ fontFamily: FONT, fontSize: 11, color: TEXT_MUTE }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Access badge + CTA — pinned to the bottom so every tile ends alike */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginTop: "auto",
            paddingTop: 4,
          }}
        >
          <AccessBadge label={badge} isFree={isFree} />

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            // The tile itself navigates; without this the CTA would fire it a second time.
            onClick={(e) => {
              e.stopPropagation();
              onNavigate?.();
            }}
            style={{
              padding: "8px 18px",
              borderRadius: 12,
              background: hovered
                ? `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_SOFT} 100%)`
                : "rgba(78,91,146,0.07)",
              color: hovered ? "#ffffff" : PRIMARY,
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 12,
              whiteSpace: "nowrap",
              transition: "background 0.22s, color 0.22s",
              boxShadow: hovered ? "0 4px 16px rgba(78,91,146,0.26)" : "none",
            }}
          >
            {cta}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
