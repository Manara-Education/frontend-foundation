import { useEffect, useId, useRef, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, X, CheckCircle2 } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/course-details.formatter";
import { useCheckout } from "../hooks/use-checkout";
import type { CheckoutKind, CourseDetailData } from "../types/course-details.types";
import { CheckoutField } from "./checkout-field";

interface CheckoutModalProps {
  course: CourseDetailData;
  kind: CheckoutKind;
  /**
   * The amount, already formatted — shown for confirmation only. What is actually charged is
   * the backend's decision, taken from the course's or the plan's own stored price.
   */
  amountLabel: string;
  /** What the amount buys: `"شراء مرة واحدة"`, or the chosen plan's name. */
  termsLabel: string;
  /** Present for a subscription: the plan the learner picked. The only value submitted. */
  planId?: number | null;
  onSuccess: () => void;
  onFailure: () => void;
  onCancel: () => void;
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
  "--rs-sheet-max": "440px",
  borderRadius: 24,
  background: "#FFFFFF",
  boxShadow: "0 40px 100px rgba(10,13,40,0.30), 0 8px 32px rgba(10,13,40,0.14)",
} as CSSProperties;

export function CheckoutModal({
  course,
  kind,
  amountLabel,
  termsLabel,
  planId,
  onSuccess,
  onFailure,
  onCancel,
}: CheckoutModalProps) {
  const isFree = kind === "free";
  const {
    step, form, canPay,
    setName, handlePay,
  } = useCheckout({ courseId: course.id, kind, planId, onSuccess, onFailure });
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);
  const stepRef = useRef(step);
  const titleId = useId();
  const courseTitleId = useId();

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => {
      (closeRef.current ?? dialogRef.current)?.focus({ preventScroll: true });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (stepRef.current === "form") {
          event.preventDefault();
          onCancelRef.current();
        }
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
      const active = document.activeElement;

      if (!(active instanceof HTMLElement) || !dialog.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && step === "form") onCancel();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,13,40,0.68)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <motion.div
        ref={dialogRef}
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={courseTitleId}
        tabIndex={-1}
        className="rs-sheet"
        style={sheetStyle}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`,
            padding: "clamp(16px, 5vw, 22px) clamp(18px, 6vw, 24px) clamp(16px, 5vw, 20px)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            {step === "form" && (
              <motion.button
                ref={closeRef}
                type="button"
                aria-label="إغلاق نافذة الدفع"
                className="rs-touch"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onCancel}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  border: "none", background: "rgba(255,255,255,0.16)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                  flexShrink: 0,
                }}
              >
                <X size={16} strokeWidth={2.5} />
              </motion.button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 11, flex: 1, minWidth: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lock size={16} color="#fff" strokeWidth={2} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: FONT, fontSize: 11, color: "rgba(255,255,255,0.70)", marginBottom: 2 }}>
                  نافذة دفع آمنة
                </div>
                <div id={titleId} style={{ fontFamily: FONT, fontSize: 15, color: "#fff", lineHeight: 1.35, fontWeight: 700 }}>
                  تأكيد الاشتراك
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 18, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 6, minWidth: 0 }}>
            <span style={{ fontFamily: FONT, fontSize: "clamp(30px, 10vw, 38px)", color: "#fff", lineHeight: 1 }}>
              {amountLabel}
            </span>
            {!isFree && (
              <span
                className="rs-longform"
                style={{ fontFamily: FONT, fontSize: 13, color: "rgba(255,255,255,0.62)", minWidth: 0 }}
              >
                {termsLabel}
              </span>
            )}
          </div>
        </div>

        <div
          className="rs-sheet__body"
          style={{
            flex: "1 1 auto",
            minBlockSize: 0,
            padding: "clamp(18px, 6vw, 24px) clamp(18px, 6vw, 24px) 12px",
          }}
        >
          <div
            id={courseTitleId}
            className="rs-longform"
            style={{ fontFamily: FONT, fontSize: 13, color: "#6B7280", lineHeight: 1.65, marginBottom: 14 }}
          >
            {course.title}
          </div>

          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                {isFree ? (
                  <div style={{ textAlign: "center", padding: "12px 0 20px" }}>
                    <div style={{ fontFamily: FONT, fontSize: 15, color: "#1F2937", marginBottom: 8 }}>دورة مجانية بالكامل</div>
                    <p className="rs-longform" style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4", lineHeight: 1.7, margin: 0 }}>
                      انقر أدناه للحصول على وصول فوري ومجاني لجميع الدروس
                    </p>
                  </div>
                ) : (
                  <CheckoutField label="الاسم الكامل" placeholder="اسمك الكامل" value={form.name} onChange={setName} fieldDir="rtl" />
                )}
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 0 28px", gap: 16 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                  style={{
                    width: 52, height: 52, borderRadius: "50%",
                    border: "3px solid rgba(78,91,146,0.14)",
                    borderTopColor: PRIMARY,
                  }}
                />
                <div style={{ fontFamily: FONT, fontSize: 15, color: "#1F2937" }}>جارٍ معالجة الدفع...</div>
                <div style={{ fontFamily: FONT, fontSize: 12, color: "#B0B7D4" }}>يُرجى عدم إغلاق هذه النافذة</div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0 22px", gap: 14, textAlign: "center" }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    width: 68, height: 68, borderRadius: "50%",
                    background: "rgba(34,197,94,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <CheckCircle2 size={34} color="#15803D" strokeWidth={2} />
                </motion.div>
                <div>
                  <div style={{ fontFamily: FONT, fontSize: 19, color: "#1F2937", marginBottom: 6 }}>تمّت العملية بنجاح! 🎉</div>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4" }}>جاري فتح الدروس لك الآن...</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step === "form" && (
          <div
            className="rs-sheet__footer"
            style={{
              paddingInline: "clamp(18px, 6vw, 24px)",
              paddingBlockStart: 0,
              "--rs-sheet-footer-pad": "clamp(18px, 6vw, 20px)",
            } as CSSProperties}
          >
            <motion.button
              type="button"
              whileHover={canPay ? { scale: 1.015 } : {}}
              whileTap={canPay ? { scale: 0.98 } : {}}
              onClick={canPay ? handlePay : undefined}
              style={{
                width: "100%",
                minHeight: 48,
                padding: "13px 20px",
                borderRadius: 14,
                background: canPay
                  ? `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`
                  : "rgba(78,91,146,0.25)",
                color: "#fff",
                border: "none",
                cursor: canPay ? "pointer" : "not-allowed",
                fontFamily: FONT,
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                boxShadow: canPay ? "0 6px 24px rgba(78,91,146,0.32)" : "none",
                transition: "background 0.2s, box-shadow 0.2s",
              }}
            >
              <Lock size={15} strokeWidth={2} />
              <span className="rs-longform">{isFree ? "ابدأ التعلم مجاناً" : `ادفع ${amountLabel} وابدأ التعلم`}</span>
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
