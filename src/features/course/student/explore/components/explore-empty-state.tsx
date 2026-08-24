/**
 * What the grid shows when nothing comes back — either the search matched no course, or
 * the catalogue itself is empty. Only the first case offers a reset, because there is no
 * filter to clear in the second.
 */
import { motion } from "motion/react";
import { Compass, Sparkles } from "lucide-react";
import { FONT, PRIMARY, PRIMARY_SOFT, TEXT_DARK, TEXT_MUTE } from "../formatters/explore.formatter";

interface ExploreEmptyStateProps {
  isFiltered: boolean;
  onReset: () => void;
}

export function ExploreEmptyState({ isFiltered, onReset }: ExploreEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "72px 32px",
        gap: 20,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 28,
          background: "rgba(78,91,146,0.06)",
          border: "1.5px solid rgba(78,91,146,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(78,91,146,0.32)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Compass size={34} strokeWidth={1.3} />
        <div
          style={{
            position: "absolute",
            top: -7,
            left: -7,
            width: 26,
            height: 26,
            borderRadius: 9,
            background: "rgba(78,91,146,0.08)",
            border: "1.5px solid rgba(78,91,146,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(78,91,146,0.4)",
          }}
        >
          <Sparkles size={12} strokeWidth={1.5} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
        <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: TEXT_DARK, margin: 0 }}>
          {isFiltered ? "لا توجد دورات مطابقة لبحثك" : "لا توجد دورات متاحة حالياً"}
        </h3>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 14,
            color: TEXT_MUTE,
            lineHeight: 1.75,
            margin: 0,
            maxWidth: 300,
          }}
        >
          {isFiltered
            ? "جرّب تغيير كلمات البحث أو ابحث بمجال تعليمي آخر"
            : "ما إن تُنشر دورات جديدة حتى تظهر هنا مباشرة"}
        </p>
      </div>

      {isFiltered && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          style={{
            padding: "11px 26px",
            borderRadius: 14,
            background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_SOFT} 100%)`,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 18px rgba(78,91,146,0.22)",
          }}
        >
          <Compass size={15} strokeWidth={2} />
          إعادة ضبط البحث
        </motion.button>
      )}
    </motion.div>
  );
}
