import { motion } from "motion/react";
import { CheckCircle } from "lucide-react";
import { FONT, PRIMARY } from "@/features/course/Instructor/course-editor/components/editor-theme";

interface SuccessOverlayProps {
  title: string;
  onClose: () => void;
}

/**
 * Shown once the wizard's aggregate save lands. The course already carries its
 * lessons, exams and pricing at this point, so the only action left is to leave.
 */
export function SuccessOverlay({ title, onClose }: SuccessOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: "rgba(30,35,64,0.45)",
        backdropFilter: "blur(6px)",
        padding: 16,
        overflowY: "auto",
      }}
    >
      <div
        className="rs-sheet"
        dir="rtl"
        style={{
          "--rs-sheet-max": "400px",
          background: "#fff",
          borderRadius: "clamp(18px, 5vw, 28px)",
          boxShadow: "0 24px 80px rgba(78,91,146,0.25)",
          fontFamily: FONT,
        } as React.CSSProperties}
      >
        <div
          className="rs-sheet__body"
          style={{
            paddingBlock: "clamp(24px, 6vw, 40px)",
            paddingInline: "clamp(18px, 6vw, 40px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            minBlockSize: 0,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 18 }}
            className="rounded-full flex items-center justify-center"
            style={{ width: 72, height: 72, background: "rgba(39,174,96,0.12)", color: "#27AE60", flexShrink: 0 }}
          >
            <CheckCircle size={36} />
          </motion.div>
          <div className="text-center flex flex-col gap-1.5 rs-longform" style={{ minInlineSize: 0 }}>
            <h2 style={{ fontWeight: 700, fontSize: 20, color: "#1E2340", lineHeight: 1.4 }}>
              تم إنشاء الدورة بنجاح!
            </h2>
            <p style={{ fontSize: 14, color: "#717182", lineHeight: 1.7 }}>
              تم إنشاء دورة «{title}» — يمكنك الآن نشر الدورة أو مراجعة المحتوى.
            </p>
          </div>
        </div>
        <div className="rs-sheet__footer" style={{ paddingBlockStart: 12, paddingInline: "clamp(18px, 6vw, 40px)" }}>
          <button
            onClick={onClose}
            className="rs-touch w-full rounded-2xl"
            style={{
              minHeight: 48,
              paddingBlock: 12,
              paddingInline: 16,
              background: PRIMARY,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 15,
              boxShadow: "0 4px 16px rgba(78,91,146,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(78,91,146,0.38)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(78,91,146,0.3)";
            }}
          >
            العودة إلى الرئيسية
          </button>
        </div>
      </div>
    </motion.div>
  );
}
