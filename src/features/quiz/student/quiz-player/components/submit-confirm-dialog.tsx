import { motion } from "motion/react";
import { ClipboardList } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/quiz-player.formatter";

interface SubmitConfirmDialogProps {
  onConfirm: () => void;
  onReview: () => void;
}

export function SubmitConfirmDialog({ onConfirm, onReview }: SubmitConfirmDialogProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: "rgba(14,18,42,0.5)",
        backdropFilter: "blur(6px)",
        zIndex: 200,
      }}
      onClick={onReview}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "32px 28px",
          maxWidth: 400,
          width: "90%",
          boxShadow: "0 24px 80px rgba(14,18,42,0.22)",
          fontFamily: FONT,
        }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="rounded-full flex items-center justify-center"
            style={{ width: 60, height: 60, background: "rgba(78,91,146,0.09)", color: PRIMARY }}
          >
            <ClipboardList size={28} strokeWidth={1.6} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E2340", margin: 0, fontFamily: FONT }}>
              تسليم الاختبار؟
            </h3>
            <p style={{ fontSize: 13, color: "#717182", marginTop: 8, lineHeight: 1.75, fontFamily: FONT }}>
              تأكد من إجابة جميع الأسئلة قبل تسليم الاختبار.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onReview}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                background: "rgba(78,91,146,0.07)",
                color: "#717182",
                border: "1.5px solid rgba(78,91,146,0.15)",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              مراجعة الإجابات
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 4px 14px rgba(78,91,146,0.28)",
              }}
            >
              تسليم
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
