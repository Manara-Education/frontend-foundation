import { motion } from "motion/react";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/quiz-player.formatter";
import type { QuizView } from "../types/quiz-player.types";

interface QuizIntroProps {
  quiz: QuizView;
  onStart: () => void;
}

export function QuizIntro({ quiz, onStart }: QuizIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      dir="rtl"
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1.5px solid rgba(78,91,146,0.12)",
        padding: "clamp(22px, 7vw, 28px) clamp(16px, 6vw, 28px) clamp(20px, 6vw, 24px)",
        boxShadow: "0 4px 20px rgba(78,91,146,0.07)",
        boxSizing: "border-box",
        maxWidth: "100%",
      }}
    >
      <div className="flex flex-col items-center gap-5 text-center" style={{ minWidth: 0 }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 20 }}
          className="rounded-2xl flex items-center justify-center"
          style={{
            width: 64,
            height: 64,
            background: "linear-gradient(135deg, rgba(78,91,146,0.12) 0%, rgba(78,91,146,0.07) 100%)",
            color: PRIMARY,
          }}
        >
          <ClipboardList size={28} strokeWidth={1.6} />
        </motion.div>

        <div>
          <div className="rs-longform" style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, color: "#1E2340" }}>
            {quiz.title}
          </div>
          {quiz.instructions && (
            <div
              className="rs-longform"
              style={{
                fontFamily: FONT,
                fontSize: 13.5,
                color: "#717182",
                marginTop: 8,
                lineHeight: 1.7,
                maxWidth: 440,
              }}
            >
              {quiz.instructions}
            </div>
          )}
        </div>

        {/* Stats */}
        <div
          className="flex gap-6 flex-wrap justify-center"
          style={{
            padding: "16px 24px",
            background: "rgba(78,91,146,0.04)",
            borderRadius: 14,
            border: "1px solid rgba(78,91,146,0.09)",
            width: "100%",
            maxWidth: 400,
            boxSizing: "border-box",
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: PRIMARY }}>
              {quiz.questions.length}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>عدد الأسئلة</div>
          </div>
          <div style={{ width: 1, background: "rgba(78,91,146,0.1)", alignSelf: "stretch" }} />
          <div className="flex flex-col items-center gap-1">
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: "#27AE60" }}>
              {quiz.passingScore}%
            </div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>درجة النجاح المطلوبة</div>
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          style={{
            minHeight: 50,
            paddingBlock: 12,
            paddingInline: 28,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 6px 22px rgba(78,91,146,0.3)",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <span className="rs-longform" style={{ minWidth: 0 }}>بدء الاختبار</span>
          <ArrowLeft size={16} style={{ flexShrink: 0 }} />
        </motion.button>
      </div>
    </motion.div>
  );
}
