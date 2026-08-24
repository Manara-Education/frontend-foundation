import { Trophy } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { FONT, SUCCESS } from "./lesson.constants";

interface LessonCompletionBannerProps {
  /** The course this lesson belongs to, or `null` when its summary could not be read. */
  courseTitle: string | null;
}

/**
 * The green trophy card the reference puts above the lesson header once the lesson is
 * complete. It only reports the lesson's completion state — it never sets it.
 */
export function LessonCompletionBanner({ courseTitle }: LessonCompletionBannerProps) {
  // The entry motion is decoration; a learner who asked for less of it gets the card
  // without the slide and scale, the same way the banner carousel treats its own.
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      dir="rtl"
      style={{
        marginBottom: 16,
        padding: "20px 24px",
        borderRadius: 20,
        background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.04) 100%)",
        border: "1.5px solid rgba(34,197,94,0.22)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 15,
          background: "rgba(34,197,94,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Trophy size={22} color={SUCCESS} strokeWidth={1.8} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT, fontSize: 15, color: "#15803D", marginBottom: 2 }}>
          أحسنت! لقد أتممت هذا الدرس
        </div>
        {/*
          The line names the course, so it is left out rather than printed half-empty when
          the course summary is the one thing that did not load.
        */}
        {courseTitle && (
          <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>
            استمر في التعلم لإكمال دورة {courseTitle}
          </div>
        )}
      </div>
    </motion.div>
  );
}
