import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { FONT } from "../formatters/banners.formatter";

interface DeleteBannerDialogProps {
  name: string;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteBannerDialog({ name, deleting, onConfirm, onCancel }: DeleteBannerDialogProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "rgba(14,18,42,0.5)", backdropFilter: "blur(6px)", zIndex: 200 }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "32px 28px",
          maxWidth: 400,
          width: "90%",
          boxShadow: "0 24px 80px rgba(14,18,42,0.22)",
          fontFamily: FONT,
        }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="rounded-full flex items-center justify-center"
            style={{ width: 60, height: 60, background: "rgba(212,24,61,0.1)", color: "#D4183D" }}
          >
            <AlertTriangle size={28} strokeWidth={1.8} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E2340", margin: 0, fontFamily: FONT }}>
              حذف الإعلان؟
            </h3>
            <p style={{ fontSize: 13, color: "#717182", marginTop: 8, lineHeight: 1.75, fontFamily: FONT }}>
              سيتم حذف الإعلان «{name}» نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                background: "rgba(78,91,146,0.07)",
                color: "#717182",
                border: "1.5px solid rgba(78,91,146,0.15)",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                background: deleting ? "rgba(212,24,61,0.55)" : "#D4183D",
                color: "#fff",
                border: "none",
                cursor: deleting ? "default" : "pointer",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: deleting ? "none" : "0 4px 14px rgba(212,24,61,0.25)",
              }}
            >
              {deleting ? "جارٍ الحذف..." : "حذف الإعلان"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
