import { motion } from "motion/react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { DANGER, FONT, PRIMARY, formatOptionLetter } from "../formatters/quiz-player.formatter";
import type { QuizHintState, QuizView } from "../types/quiz-player.types";
import { HintCard } from "./hint-card";

interface QuizTakingProps {
  quiz: QuizView;
  answers: Record<string, string>;
  currentIndex: number;
  isSubmitting: boolean;
  submitError: string | null;
  hintState: QuizHintState;
  onAnswer: (questionId: string, optionId: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  onRequestHint: (questionId: string) => void;
}

export function QuizTaking({
  quiz,
  answers,
  currentIndex,
  isSubmitting,
  submitError,
  hintState,
  onAnswer,
  onNext,
  onPrev,
  onSubmit,
  onRequestHint,
}: QuizTakingProps) {
  const question = quiz.questions[currentIndex];
  const total = quiz.questions.length;
  const isLast = currentIndex === total - 1;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === total;
  const canSubmit = allAnswered && !isSubmitting;
  const progress = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22 }}
      dir="rtl"
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1.5px solid rgba(78,91,146,0.12)",
        padding: "24px 24px 20px",
        boxShadow: "0 4px 20px rgba(78,91,146,0.07)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: PRIMARY }}>
          السؤال {currentIndex + 1} من {total}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>
          {answeredCount} من {total} أجبت
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 4,
          borderRadius: 99,
          background: "rgba(78,91,146,0.08)",
          overflow: "hidden",
          marginBottom: 22,
        }}
      >
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: 99,
            background: `linear-gradient(90deg, ${PRIMARY} 0%, #7080B8 100%)`,
          }}
        />
      </div>

      {/* Question text */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 16,
          fontWeight: 600,
          color: "#1E2340",
          lineHeight: 1.7,
          marginBottom: 20,
        }}
      >
        {question.text}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2.5 mb-6">
        {question.options.map((opt, oi) => {
          const isSelected = answers[question.id] === opt.id;
          return (
            <motion.button
              key={opt.id}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => onAnswer(question.id, opt.id)}
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 14,
                background: isSelected ? "rgba(78,91,146,0.08)" : "rgba(78,91,146,0.025)",
                border: `1.5px solid ${isSelected ? PRIMARY : "rgba(78,91,146,0.12)"}`,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                textAlign: "right",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all 0.15s",
                boxShadow: isSelected ? "0 0 0 3px rgba(78,91,146,0.08)" : "none",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 99,
                  flexShrink: 0,
                  border: `2px solid ${isSelected ? PRIMARY : "rgba(78,91,146,0.2)"}`,
                  background: isSelected ? PRIMARY : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                {isSelected ? (
                  <Check size={13} color="#fff" strokeWidth={3} />
                ) : (
                  <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: "#9BA3C4" }}>
                    {formatOptionLetter(oi)}
                  </span>
                )}
              </div>

              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 14,
                  color: isSelected ? "#1E2340" : "#3D4466",
                  fontWeight: isSelected ? 600 : 400,
                  flex: 1,
                  lineHeight: 1.5,
                }}
              >
                {opt.text}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Hint by AI */}
      {question.hintByAiEnabled && (
        <div style={{ marginBottom: 20 }}>
          {hintState.hints[question.id] ? (
            <HintCard hint={hintState.hints[question.id]} />
          ) : hintState.loadingQuestionId === question.id ? (
            <div
              className="flex items-center gap-3"
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                background: "rgba(99,114,172,0.05)",
                border: "1px solid rgba(78,91,146,0.15)",
              }}
            >
              <Loader2
                size={15}
                color={PRIMARY}
                strokeWidth={2.2}
                className="animate-spin"
                style={{ flexShrink: 0 }}
              />
              <span style={{ fontFamily: FONT, fontSize: 13, color: "#717182" }}>
                جارٍ إعداد التلميح بواسطة الذكاء الاصطناعي...
              </span>
            </div>
          ) : hintState.errorQuestionId === question.id ? (
            <div
              className="flex items-center justify-between gap-3"
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: "rgba(212,24,61,0.04)",
                border: "1px solid rgba(212,24,61,0.15)",
              }}
            >
              <span style={{ fontFamily: FONT, fontSize: 13, color: "#B91C1C" }}>
                تعذر إنشاء التلميح بواسطة الذكاء الاصطناعي الآن.
              </span>
              <button
                onClick={() => onRequestHint(question.id)}
                style={{
                  height: 32,
                  paddingLeft: 14,
                  paddingRight: 14,
                  borderRadius: 9,
                  background: "rgba(212,24,61,0.09)",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontSize: 12,
                  color: "#B91C1C",
                  fontWeight: 600,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <button
              onClick={() => onRequestHint(question.id)}
              className="flex items-center gap-2"
              style={{
                height: 40,
                paddingLeft: 18,
                paddingRight: 18,
                borderRadius: 12,
                background: "rgba(99,114,172,0.06)",
                border: "1.5px solid rgba(78,91,146,0.18)",
                cursor: "pointer",
                fontFamily: FONT,
                fontSize: 13,
                color: PRIMARY,
                fontWeight: 600,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(78,91,146,0.12)";
                e.currentTarget.style.borderColor = "rgba(78,91,146,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(99,114,172,0.06)";
                e.currentTarget.style.borderColor = "rgba(78,91,146,0.18)";
              }}
            >
              <Sparkles size={14} strokeWidth={1.8} />
              اطلب تلميحًا بواسطة الذكاء الاصطناعي
            </button>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          style={{
            height: 42,
            paddingLeft: 18,
            paddingRight: 18,
            borderRadius: 12,
            background: "rgba(78,91,146,0.06)",
            border: "1.5px solid rgba(78,91,146,0.13)",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 13.5,
            color: currentIndex === 0 ? "#C4C9DC" : PRIMARY,
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.15s",
            opacity: currentIndex === 0 ? 0.5 : 1,
          }}
        >
          <ArrowRight size={15} /> السابق
        </button>

        {isLast ? (
          <motion.button
            whileHover={canSubmit ? { scale: 1.03 } : {}}
            whileTap={canSubmit ? { scale: 0.97 } : {}}
            onClick={canSubmit ? onSubmit : undefined}
            style={{
              height: 42,
              paddingLeft: 22,
              paddingRight: 22,
              borderRadius: 12,
              background: canSubmit
                ? `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`
                : "rgba(78,91,146,0.08)",
              border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 14,
              color: canSubmit ? "#fff" : "#9BA3C4",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: canSubmit ? "0 4px 14px rgba(78,91,146,0.28)" : "none",
              transition: "all 0.15s",
            }}
          >
            {isSubmitting && <Loader2 size={15} strokeWidth={2.2} className="animate-spin" />}
            {isSubmitting ? "جارٍ التسليم..." : "تسليم الاختبار"}
          </motion.button>
        ) : (
          <button
            onClick={onNext}
            style={{
              height: 42,
              paddingLeft: 22,
              paddingRight: 22,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 14,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 14px rgba(78,91,146,0.22)",
              transition: "all 0.15s",
            }}
          >
            التالي <ArrowLeft size={15} />
          </button>
        )}
      </div>

      {/* Unanswered warning */}
      {isLast && !allAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-3"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(234,179,8,0.07)",
            border: "1px solid rgba(234,179,8,0.2)",
          }}
        >
          <AlertTriangle size={13} color="#CA8A04" />
          <span style={{ fontFamily: FONT, fontSize: 12, color: "#A16207" }}>
            أجب على جميع الأسئلة ({total - answeredCount} متبقية) قبل التسليم
          </span>
        </motion.div>
      )}

      {/* Submission refused by the server — the grader is the only thing that can say so */}
      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-3"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(212,24,61,0.04)",
            border: "1px solid rgba(212,24,61,0.15)",
          }}
        >
          <AlertTriangle size={13} color={DANGER} />
          <span style={{ fontFamily: FONT, fontSize: 12, color: "#B91C1C" }}>{submitError}</span>
        </motion.div>
      )}
    </motion.div>
  );
}
