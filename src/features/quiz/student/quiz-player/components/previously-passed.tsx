import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { FONT, SUCCESS } from "../formatters/quiz-player.formatter";
import type { QuizView } from "../types/quiz-player.types";

interface PreviouslyPassedProps {
  quiz: QuizView;
  onReview: () => void;
}

export function PreviouslyPassed({ quiz, onReview }: PreviouslyPassedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      dir="rtl"
      style={{
        background: "rgba(34,197,94,0.04)",
        borderRadius: 18,
        border: "1.5px solid rgba(34,197,94,0.2)",
        padding: "18px 20px",
      }}
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div
          className="rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ width: 44, height: 44, background: "rgba(34,197,94,0.12)", color: SUCCESS }}
        >
          <CheckCircle2 size={22} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: "#15803D" }}>
            تم اجتياز الاختبار
          </div>
          <div style={{ fontFamily: FONT, fontSize: 12.5, color: "#6B7280", marginTop: 3 }}>
            {quiz.title} · نتيجتك: {quiz.bestScore ?? 0}%
          </div>
        </div>
        <button
          onClick={onReview}
          style={{
            height: 36,
            paddingLeft: 16,
            paddingRight: 16,
            borderRadius: 10,
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
            cursor: "pointer",
            fontFamily: FONT,
            fontSize: 12.5,
            color: "#15803D",
            fontWeight: 600,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(34,197,94,0.16)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(34,197,94,0.1)";
          }}
        >
          إعادة المحاولة
        </button>
      </div>
    </motion.div>
  );
}
