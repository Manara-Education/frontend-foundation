import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { FONT } from "./lesson.constants";

interface CompletionErrorNoticeProps {
  message: string;
}

/** The server's own refusal, shown verbatim rather than restated as a client rule. */
export function CompletionErrorNotice({ message }: CompletionErrorNoticeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      dir="rtl"
      style={{
        padding: "13px 18px",
        borderRadius: 14,
        background: "rgba(212,24,61,0.04)",
        border: "1.5px solid rgba(212,24,61,0.18)",
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
          background: "rgba(212,24,61,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#D4183D",
        }}
      >
        <AlertTriangle size={16} strokeWidth={1.8} />
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#B91C1C" }}>
        {message}
      </div>
    </motion.div>
  );
}
