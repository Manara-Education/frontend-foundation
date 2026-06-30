import { AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const FONT = "'Cairo', sans-serif";

interface ErrorDialogProps {
  open: boolean;
  message?: string;
  onClose: () => void;
}

export function ErrorDialog({ open, message, onClose }: ErrorDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,24,40,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            style={{
              background: "#ffffff",
              borderRadius: 22,
              boxShadow: "0 24px 80px rgba(20,24,40,0.22)",
              padding: "28px 28px 22px",
              width: "100%",
              maxWidth: 380,
              fontFamily: FONT,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                background: "rgba(212,24,61,0.10)",
                color: "#D4183D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <AlertTriangle size={24} strokeWidth={2} />
            </div>

            <div style={{ fontWeight: 700, fontSize: 17, color: "#1E2340", marginBottom: 6 }}>
              حدث خطأ ما
            </div>
            <div style={{ fontSize: 13, color: "#6B7290", lineHeight: 1.7, marginBottom: 20 }}>
              {message ?? "تعذّر إكمال العملية. يرجى المحاولة مرة أخرى."}
            </div>

            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "11px 16px",
                borderRadius: 12,
                background: "#4E5B92",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              حسنًا
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
