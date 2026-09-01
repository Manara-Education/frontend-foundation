import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RefreshCw, XCircle } from "lucide-react";
import { DANGER, FONT, PRIMARY } from "../formatters/quiz-player.formatter";
import type { QuizResultView } from "../types/quiz-player.types";
import { ResultReviewList } from "./result-review-list";

interface FailedResultProps {
  result: QuizResultView;
  subtitle: string;
  returnLabel: string;
  onRetry: () => void;
  onReturn: () => void;
}

export function FailedResult({
  result,
  subtitle,
  returnLabel,
  onRetry,
  onReturn,
}: FailedResultProps) {
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
        border: "1.5px solid rgba(212,24,61,0.15)",
        padding: "clamp(22px, 7vw, 32px) clamp(16px, 6vw, 28px)",
        boxShadow: "0 4px 24px rgba(212,24,61,0.07)",
        boxSizing: "border-box",
        maxWidth: "100%",
      }}
    >
      <div className="flex flex-col items-center gap-5 text-center" style={{ minWidth: 0 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 18 }}
          className="rounded-full flex items-center justify-center"
          style={{ width: 72, height: 72, background: "rgba(212,24,61,0.08)", color: DANGER }}
        >
          <XCircle size={34} strokeWidth={1.6} />
        </motion.div>

        <div>
          <div className="rs-longform" style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: "#1E2340" }}>
            لم تجتز الاختبار بعد
          </div>
          <div
            className="rs-longform"
            style={{
              fontFamily: FONT,
              fontSize: 14,
              color: "#717182",
              marginTop: 6,
              lineHeight: 1.7,
              maxWidth: 340,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Score card */}
        <div
          style={{
            background: "rgba(212,24,61,0.04)",
            borderRadius: 16,
            border: "1px solid rgba(212,24,61,0.12)",
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
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 28, color: DANGER, lineHeight: 1 }}>
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

        {/* Actions */}
        <div
          className="rs-cluster rs-cluster--stretch"
          style={{ "--rs-cluster-gap": "12px", width: "100%", maxWidth: 420 } as CSSProperties}
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRetry}
            style={{
              minHeight: 48,
              paddingBlock: 12,
              paddingInline: 22,
              borderRadius: 13,
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              boxShadow: "0 4px 16px rgba(78,91,146,0.28)",
              flex: "1 1 150px",
              boxSizing: "border-box",
            }}
          >
            <RefreshCw size={15} style={{ flexShrink: 0 }} />
            <span className="rs-longform" style={{ minWidth: 0 }}>إعادة الاختبار</span>
          </motion.button>
          <button
            type="button"
            onClick={onReturn}
            style={{
              minHeight: 48,
              paddingBlock: 12,
              paddingInline: 20,
              borderRadius: 13,
              background: "transparent",
              color: "#717182",
              border: "1.5px solid rgba(78,91,146,0.16)",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 14,
              transition: "all 0.15s",
              flex: "1 1 150px",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(78,91,146,0.3)";
              e.currentTarget.style.color = PRIMARY;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)";
              e.currentTarget.style.color = "#717182";
            }}
          >
            <span className="rs-longform">{returnLabel}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
