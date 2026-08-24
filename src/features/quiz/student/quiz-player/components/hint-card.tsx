import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, Sparkles } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/quiz-player.formatter";

interface HintCardProps {
  hint: string;
}

export function HintCard({ hint }: HintCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        borderRadius: 14,
        border: "1.5px solid rgba(99,114,172,0.2)",
        background: "linear-gradient(135deg, rgba(78,91,146,0.04) 0%, rgba(99,114,172,0.06) 100%)",
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center justify-between gap-3 cursor-pointer"
        style={{ padding: "12px 14px" }}
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} strokeWidth={1.8} color={PRIMARY} />
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: PRIMARY }}>
            تلميح بواسطة الذكاء الاصطناعي
          </span>
        </div>
        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          <span
            style={{
              fontFamily: FONT,
              fontSize: 11,
              color: "#9BA3C4",
              background: "rgba(78,91,146,0.07)",
              borderRadius: 6,
              padding: "2px 8px",
              cursor: "default",
              userSelect: "none",
            }}
          >
            تم عرض التلميح
          </span>
          <ChevronUp
            size={14}
            color="#9BA3C4"
            strokeWidth={2}
            style={{
              transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "0 14px 14px",
                borderTop: "1px solid rgba(78,91,146,0.1)",
                paddingTop: 12,
              }}
            >
              <p style={{ fontFamily: FONT, fontSize: 13.5, color: "#1E2340", lineHeight: 1.75, margin: 0 }}>
                {hint}
              </p>
              <p style={{ fontFamily: FONT, fontSize: 11, color: "#B0B7D4", marginTop: 8, lineHeight: 1.5 }}>
                تم إنشاء هذا التلميح بواسطة الذكاء الاصطناعي وقد لا يكون دقيقًا دائمًا.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
