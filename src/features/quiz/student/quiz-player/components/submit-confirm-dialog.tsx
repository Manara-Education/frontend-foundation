import { useEffect, useId, useRef, type CSSProperties } from "react";
import { motion } from "motion/react";
import { ClipboardList } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/quiz-player.formatter";

interface SubmitConfirmDialogProps {
  onConfirm: () => void;
  onReview: () => void;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const sheetStyle = {
  "--rs-sheet-max": "400px",
  background: "#fff",
  borderRadius: 24,
  boxShadow: "0 24px 80px rgba(14,18,42,0.22)",
  fontFamily: FONT,
} as CSSProperties;

export function SubmitConfirmDialog({ onConfirm, onReview }: SubmitConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => {
      reviewRef.current?.focus({ preventScroll: true });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onReview();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onReview]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: "rgba(14,18,42,0.5)",
        backdropFilter: "blur(6px)",
        zIndex: 200,
        padding: 16,
        boxSizing: "border-box",
      }}
      onClick={onReview}
    >
      <motion.div
        ref={dialogRef}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        className="rs-sheet"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        style={sheetStyle}
      >
        <div
          className="rs-sheet__body flex flex-col items-center gap-4 text-center"
          style={{ padding: "clamp(20px, 7vw, 32px) clamp(18px, 6vw, 28px) 16px" }}
        >
          <div
            className="rounded-full flex items-center justify-center"
            style={{ width: 60, height: 60, background: "rgba(78,91,146,0.09)", color: PRIMARY }}
          >
            <ClipboardList size={28} strokeWidth={1.6} />
          </div>
          <div>
            <h3 id={titleId} style={{ fontSize: 18, fontWeight: 700, color: "#1E2340", margin: 0, fontFamily: FONT }}>
              تسليم الاختبار؟
            </h3>
            <p
              id={descriptionId}
              className="rs-longform"
              style={{ fontSize: 13, color: "#717182", marginTop: 8, lineHeight: 1.75, fontFamily: FONT }}
            >
              تأكد من إجابة جميع الأسئلة قبل تسليم الاختبار.
            </p>
          </div>
        </div>

        <div
          className="rs-sheet__footer"
          style={{ padding: "0 clamp(18px, 6vw, 28px) clamp(20px, 6vw, 28px)" }}
        >
          <div className="rs-cluster rs-cluster--stretch" style={{ "--rs-cluster-gap": "12px" } as CSSProperties}>
            <button
              ref={reviewRef}
              type="button"
              onClick={onReview}
              style={{
                flex: "1 1 120px",
                minHeight: 44,
                borderRadius: 12,
                background: "rgba(78,91,146,0.07)",
                color: "#717182",
                border: "1.5px solid rgba(78,91,146,0.15)",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 14,
                paddingInline: 14,
                paddingBlock: 10,
              }}
            >
              مراجعة الإجابات
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                flex: "1 1 120px",
                minHeight: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 4px 14px rgba(78,91,146,0.28)",
                paddingInline: 14,
                paddingBlock: 10,
              }}
            >
              تسليم
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
