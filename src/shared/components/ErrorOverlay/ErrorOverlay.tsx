import { motion } from "motion/react";
import { XCircle, RefreshCw } from "lucide-react";

const FONT = "'Cairo', sans-serif";

interface ErrorOverlayProps {
  message: string;
  onRetry: () => void;
  onClose: () => void;
}

export function ErrorOverlay({ message, onRetry, onClose }: ErrorOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(30,35,64,0.45)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="flex flex-col items-center gap-5 p-10 mx-4"
        dir="rtl"
        style={{
          background: "#fff",
          borderRadius: 28,
          boxShadow: "0 24px 80px rgba(78,91,146,0.25)",
          maxWidth: 400,
          width: "100%",
          fontFamily: FONT,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 18 }}
          className="rounded-full flex items-center justify-center"
          style={{ width: 72, height: 72, background: "rgba(212,24,61,0.10)", color: "#D4183D" }}
        >
          <XCircle size={36} />
        </motion.div>
        <div className="text-center flex flex-col gap-1.5">
          <h2 style={{ fontWeight: 700, fontSize: 20, color: "#1E2340" }}>حدث خطأ ما!</h2>
          <p style={{ fontSize: 14, color: "#717182", lineHeight: 1.7 }}>{message}</p>
        </div>
        <button
          onClick={onRetry}
          className="w-full rounded-2xl py-3 transition-all duration-150 flex items-center justify-center gap-2"
          style={{
            background: "#D4183D",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 15,
            boxShadow: "0 4px 16px rgba(212,24,61,0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(212,24,61,0.38)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(212,24,61,0.3)";
          }}
        >
          <RefreshCw size={16} />
          حاول مرة أخرى
        </button>
        <button
          onClick={onClose}
          style={{
            marginTop: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 13,
            color: "#9BA3C4",
            textDecoration: "underline",
          }}
        >
          إلغاء
        </button>
      </div>
    </motion.div>
  );
}
