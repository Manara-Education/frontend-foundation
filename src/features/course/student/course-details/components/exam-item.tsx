import { useState } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { QuizView } from "@/features/quiz/student/quiz-player";
import { CourseUpdatedBadge } from "@/features/course/components/course-updated-badge";
import type { ContentChange } from "../types/course-details.types";
import { UNCHANGED } from "../types/course-details.types";
import {
  EXAM_ICON,
  FONT,
  LESSON_STATUS_CONFIG,
  PRIMARY,
  formatExamStatusLabel,
  formatQuestionCount,
  toExamStatus,
} from "../formatters/course-details.formatter";

interface ExamItemProps {
  quiz: QuizView;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  /** Whether this exam is new or updated since the reader enrolled. */
  change?: ContentChange;
}

/**
 * An exam inside the curriculum, wearing the lesson row's chrome.
 *
 * The reference prototype had no module exam or final exam anywhere in the student UI,
 * so rather than invent a card for them this reuses `LessonItem`'s exact layout, spacing
 * and status palette — an exam reads as one more row of the same list.
 */
export function ExamItem({ quiz, index, isOpen, onToggle, change = UNCHANGED }: ExamItemProps) {
  const [hovered, setHovered] = useState(false);
  const status = toExamStatus(quiz);
  const cfg = LESSON_STATUS_CONFIG[status];
  const isLocked = status === "locked";
  const Icon = EXAM_ICON;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: index * 0.035 }}
      onMouseEnter={() => !isLocked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (!isLocked) onToggle();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        borderRadius: 16,
        background: isOpen
          ? "rgba(78,91,146,0.05)"
          : hovered
          ? "rgba(78,91,146,0.03)"
          : "#FFFFFF",
        border: `1.5px solid ${isOpen ? "rgba(78,91,146,0.18)" : hovered && !isLocked ? "rgba(78,91,146,0.12)" : "#ECECEC"}`,
        cursor: isLocked ? "not-allowed" : "pointer",
        transition: "all 0.18s ease",
        boxShadow: isOpen ? "0 2px 16px rgba(78,91,146,0.08)" : hovered && !isLocked ? "0 4px 16px rgba(78,91,146,0.06)" : "none",
        opacity: isLocked ? 0.6 : 1,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 9,
          background: isOpen ? "rgba(78,91,146,0.12)" : cfg.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: isOpen ? PRIMARY : cfg.color,
        }}
      >
        <Icon size={14} strokeWidth={2} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: isLocked ? "#C4C9DE" : isOpen ? PRIMARY : "#1F2937",
            lineHeight: 1.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {quiz.title}
        </div>
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap" }}
        >
          <span
            style={{
              fontFamily: FONT,
              fontSize: 10,
              padding: "1px 7px",
              borderRadius: 99,
              background: cfg.bg,
              color: cfg.color,
            }}
          >
            {formatExamStatusLabel(quiz)}
          </span>
          {/* An exam a learner has already sat and passed can still have had its questions
              rewritten under them, which is exactly when they need telling. */}
          <CourseUpdatedBadge state={change.state} summary={change.summary} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#C4C9DE", flexShrink: 0 }}>
        <span style={{ fontFamily: FONT, fontSize: 11, color: "#B0B7D4" }}>
          {formatQuestionCount(quiz.questions.length)}
        </span>
      </div>

      {!isLocked && (
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0 }}>
          <ChevronDown size={15} strokeWidth={2} style={{ color: "#9BA3C4" }} />
        </motion.div>
      )}
    </motion.div>
  );
}
