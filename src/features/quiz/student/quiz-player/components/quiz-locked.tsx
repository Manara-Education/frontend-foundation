import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { FONT } from "../formatters/quiz-player.formatter";

interface QuizLockedProps {
  title: string;
  subtitle: string;
}

/**
 * Shown when the server says the curriculum still gates this quiz.
 *
 * The reference prototype had no locked quiz because it never asked a server; the card
 * reuses the locked palette and lock glyph the reference already uses for locked
 * curriculum rows.
 */
export function QuizLocked({ title, subtitle }: QuizLockedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      dir="rtl"
      style={{
        background: "rgba(196,201,222,0.06)",
        borderRadius: 18,
        border: "1.5px solid rgba(196,201,222,0.28)",
        padding: "clamp(16px, 5vw, 18px) clamp(14px, 5vw, 20px)",
        boxSizing: "border-box",
        maxWidth: "100%",
      }}
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div
          className="rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ width: 44, height: 44, background: "rgba(196,201,222,0.16)", color: "#C4C9DE" }}
        >
          <Lock size={20} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="rs-longform" style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: "#9BA3C4" }}>
            {title}
          </div>
          <div className="rs-longform" style={{ fontFamily: FONT, fontSize: 12.5, color: "#B0B7D4", marginTop: 3, lineHeight: 1.6 }}>
            {subtitle}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
