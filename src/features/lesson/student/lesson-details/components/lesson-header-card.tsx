import { BookOpen, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { motion } from "motion/react";
import type { LessonCourseSummary, LessonView } from "../types/lesson.types";
import { FONT, PRIMARY, SUCCESS } from "./lesson.constants";

interface LessonHeaderCardProps {
  lesson: LessonView;
  /** The course the lesson sits in, or `null` when its summary could not be read. */
  course: LessonCourseSummary | null;
  isMarkedComplete: boolean;
}

/**
 * The bar reads the server's own percentage, the same figure the course details screen
 * shows. The count is only the fallback for a response that carried no percentage, and a
 * course with nothing counted yet reads as 0 rather than as a division by zero.
 */
function toProgressPercentage(course: LessonCourseSummary | null): number {
  if (!course) return 0;

  const raw =
    course.progress ??
    (course.totalLessons > 0 ? (course.completedLessons / course.totalLessons) * 100 : 0);

  return Math.min(100, Math.max(0, Math.round(raw)));
}

export function LessonHeaderCard({ lesson, course, isMarkedComplete }: LessonHeaderCardProps) {
  const progress = toProgressPercentage(course);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        borderRadius: 20,
        background: "#FFFFFF",
        border: "1.5px solid #ECECEC",
        padding: "20px 24px",
        marginBottom: 16,
        boxShadow: "0 2px 16px rgba(78,91,146,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div
            style={{
              padding: "4px 12px",
              borderRadius: 99,
              background: `rgba(78,91,146,0.08)`,
              border: `1px solid rgba(78,91,146,0.14)`,
              fontFamily: FONT,
              fontSize: 11,
              color: PRIMARY,
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            <BookOpen size={11} strokeWidth={2} />
            الدرس {lesson.number}
          </div>

          {/*
            A course whose name runs long is cut rather than allowed to push the duration
            and the status chip off the row.
          */}
          {course && (
            <div
              title={course.title}
              style={{
                fontFamily: FONT,
                fontSize: 11,
                color: "#9BA3C4",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {course.title}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={12} strokeWidth={1.5} color="#9BA3C4" />
            <span style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>
              {lesson.duration}
            </span>
          </div>

          {isMarkedComplete ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 99,
                background: "rgba(34,197,94,0.10)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <CheckCircle2 size={12} color={SUCCESS} strokeWidth={2} />
              <span style={{ fontFamily: FONT, fontSize: 11, color: "#15803D" }}>مكتمل</span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 99,
                background: "rgba(78,91,146,0.08)",
                border: "1px solid rgba(78,91,146,0.14)",
              }}
            >
              <PlayCircle size={12} color={PRIMARY} strokeWidth={2} />
              <span style={{ fontFamily: FONT, fontSize: 11, color: PRIMARY }}>قيد المشاهدة</span>
            </div>
          )}
        </div>
      </div>

      <h2
        style={{
          fontFamily: FONT,
          fontSize: 22,
          color: "#1F2937",
          lineHeight: 1.4,
          margin: "0 0 16px",
        }}
      >
        {lesson.title}
      </h2>

      {/*
        Always rendered, whatever the course figures are, so the block the skeleton
        reserves is the block that lands — the card never loses a row on loading.
      */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 7,
          }}
        >
          <span style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4" }}>
            {course?.completedLessons ?? 0} من {course?.totalLessons ?? 0} درس مكتمل
          </span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: PRIMARY }}>{progress}٪</span>
        </div>
        <div
          style={{
            width: "100%",
            height: 5,
            borderRadius: 99,
            background: "rgba(78,91,146,0.08)",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            style={{
              height: "100%",
              borderRadius: 99,
              background: `linear-gradient(90deg, ${PRIMARY} 0%, #7080B8 100%)`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
