import { motion } from "motion/react";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/courses.formatter";
import type { FilterKey } from "../types/courses.types";

interface EmptyStateProps {
  query: string;
  filter: FilterKey;
  onBrowse?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function EmptyState({ query, filter, onBrowse }: EmptyStateProps) {
  const isSearch = query.trim().length > 0;
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
      {/* Illustration */}
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: 28,
          background: "rgba(78,91,146,0.06)",
          border: "1.5px solid rgba(78,91,146,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(78,91,146,0.35)",
          position: "relative",
        }}
      >
        <BookOpen size={36} strokeWidth={1.3} />
        <div
          style={{
            position: "absolute",
            top: -6,
            left: -6,
            width: 24,
            height: 24,
            borderRadius: 8,
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

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: "#1F2937", margin: 0 }}>
          {isSearch ? "لا توجد نتائج مطابقة" : "لا توجد دورات حتى الآن"}
        </h3>
        <p style={{ fontFamily: FONT, fontSize: 14, color: "#9BA3C4", lineHeight: 1.75, margin: 0, maxWidth: 280 }}>
          {isSearch
            ? `لم يتم العثور على دورات تطابق "${query}"`
            : "ابدأ رحلتك التعليمية من الصفحة الرئيسية واستكشف الدورات المتاحة"}
        </p>
      </div>

      <button
        onClick={onBrowse}
        style={{
          padding: "11px 24px",
          borderRadius: 14,
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`,
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
        <GraduationCap size={15} strokeWidth={2} />
        استكشاف الدورات
      </button>
    </motion.div>
  );
}
