import { useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trophy } from "lucide-react";
import { FONT, PRIMARY, SUCCESS } from "../formatters/quiz-player.formatter";
import type { QuizResultView } from "../types/quiz-player.types";
import { ResultReviewList } from "./result-review-list";

interface PassedResultProps {
  result: QuizResultView;
  subtitle: string;
  actionLabel: string;
  isActionPending: boolean;
  onAction: () => void;
}

/**
 * The review list reads the graded attempt, never the quiz: `correct`, the correct
 * option and the explanation only exist on what the server returned after grading.
 */
export function PassedResult({
  result,
  subtitle,
  actionLabel,
  isActionPending,
  onAction,
}: PassedResultProps) {
  const [showExplanations, setShowExplanations] = useState(false);
  const hasReview = result.answers.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      dir="rtl"
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1.5px solid rgba(34,197,94,0.2)",
        padding: "clamp(22px, 7vw, 32px) clamp(16px, 6vw, 28px)",
        boxShadow: "0 4px 24px rgba(34,197,94,0.1)",
        boxSizing: "border-box",
        maxWidth: "100%",
      }}
    >
      <div className="flex flex-col items-center gap-5 text-center" style={{ minWidth: 0 }}>
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 18 }}
          className="rounded-full flex items-center justify-center"
          style={{ width: 72, height: 72, background: "rgba(34,197,94,0.12)", color: SUCCESS }}
        >
          <Trophy size={34} strokeWidth={1.6} />
        </motion.div>

        <div>
          <div className="rs-longform" style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: "#1E2340" }}>
            أحسنت! لقد اجتزت الاختبار
          </div>
          <div className="rs-longform" style={{ fontFamily: FONT, fontSize: 14, color: "#717182", marginTop: 6, lineHeight: 1.7 }}>
            {subtitle}
          </div>
        </div>

        {/* Score card */}
        <div
          style={{
            background: "rgba(34,197,94,0.05)",
            borderRadius: 16,
            border: "1px solid rgba(34,197,94,0.15)",
            padding: "clamp(16px, 5vw, 18px) clamp(14px, 5vw, 24px)",
            width: "100%",
            maxWidth: 380,
            boxSizing: "border-box",
          }}
        >
          <div
            className="rs-grid"
            style={{ "--rs-grid-min": "92px", "--rs-grid-gap": "14px" } as CSSProperties}
          >
            <div className="flex flex-col items-center gap-1">
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 28, color: "#15803D", lineHeight: 1 }}>
                {result.score}%
              </div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>نتيجتك</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 28, color: "#717182", lineHeight: 1 }}>
                {result.passingScore}%
              </div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>درجة النجاح المطلوبة</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 28, color: "#1E2340", lineHeight: 1 }}>
                {result.correctCount}/{result.totalQuestions}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>إجابات صحيحة</div>
            </div>
          </div>
        </div>

        {hasReview && (
          <button
            onClick={() => setShowExplanations((v) => !v)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontSize: 13,
              color: PRIMARY,
              textDecoration: "underline",
              fontWeight: 500,
              minHeight: 44,
              paddingInline: 8,
            }}
          >
            {showExplanations ? "إخفاء التوضيحات" : "عرض توضيحات الإجابات"}
          </button>
        )}

        <AnimatePresence>
          {showExplanations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", width: "100%" }}
            >
              <ResultReviewList answers={result.answers} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          whileHover={isActionPending ? {} : { scale: 1.03, y: -2 }}
          whileTap={isActionPending ? {} : { scale: 0.97 }}
          onClick={isActionPending ? undefined : onAction}
          style={{
            height: 52,
            minHeight: 52,
            paddingBlock: 13,
            paddingInline: 24,
            borderRadius: 14,
            background: "linear-gradient(135deg, #27AE60 0%, #16A34A 100%)",
            color: "#fff",
            border: "none",
            cursor: isActionPending ? "not-allowed" : "pointer",
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 6px 22px rgba(34,197,94,0.3)",
            opacity: isActionPending ? 0.7 : 1,
            width: "min(100%, 320px)",
            boxSizing: "border-box",
          }}
        >
          <Sparkles size={17} style={{ flexShrink: 0 }} />
          <span className="rs-longform" style={{ minWidth: 0 }}>{actionLabel}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
