import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { FONT } from "./lesson.constants";

/**
 * A lesson the curriculum has not opened.
 *
 * The request succeeded — the backend answers with the row's title and position and
 * withholds the video, description and quiz — so reaching this lesson by its URL shows
 * the lock rather than an empty player. The palette is the reference's own locked
 * curriculum-row palette.
 */
export function LessonLockedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      dir="rtl"
      style={{
        borderRadius: 20,
        background: "rgba(196,201,222,0.06)",
        border: "1.5px solid rgba(196,201,222,0.28)",
        padding: "36px 28px",
        marginBottom: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: "rgba(196,201,222,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#C4C9DE",
        }}
      >
        <Lock size={28} strokeWidth={1.6} />
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: "#9BA3C4" }}>
          هذا الدرس غير متاح لك بعد
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: "#B0B7D4",
            marginTop: 6,
            lineHeight: 1.7,
            maxWidth: 360,
          }}
        >
          أكمل الدروس والاختبارات السابقة في المنهج لفتح هذا الدرس.
        </div>
      </div>
    </motion.div>
  );
}
