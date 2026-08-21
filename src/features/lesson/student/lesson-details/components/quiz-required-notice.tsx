import { motion } from "motion/react";
import { Target } from "lucide-react";
import { FONT } from "./lesson.constants";

/**
 * The reference player's amber strip, shown while the lesson's quiz still gates its
 * completion. The rule itself is the backend's — this only says so.
 */
export function QuizRequiredNotice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      dir="rtl"
      style={{
        padding: "13px 18px",
        borderRadius: 14,
        background: "rgba(234,179,8,0.07)",
        border: "1.5px solid rgba(234,179,8,0.22)",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "rgba(234,179,8,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#CA8A04",
        }}
      >
        <Target size={16} strokeWidth={1.8} />
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#92400E" }}>
          يجب اجتياز اختبار الدرس قبل تسجيله كمكتمل.
        </div>
        <div style={{ fontFamily: FONT, fontSize: 11.5, color: "#A16207", marginTop: 2 }}>
          أكمل الاختبار أدناه للمتابعة.
        </div>
      </div>
    </motion.div>
  );
}
