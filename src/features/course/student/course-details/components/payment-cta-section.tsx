import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ShieldCheck, X } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/course-details.formatter";
import type { CourseDetailData } from "../types/course-details.types";
import { StripeCheckoutModal } from "./stripe-checkout-modal";

interface PaymentCTASectionProps {
  course: CourseDetailData;
  price: number | null;
  onPay: () => void;
}

export function PaymentCTASection({ course, price, onPay }: PaymentCTASectionProps) {
  const isFree = price === null;
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  function handleCancelPayment() {
    setShowCheckout(false);
    setPaymentFailed(true);
  }

  function handleSuccessPayment() {
    setShowCheckout(false);
    onPay();
  }

  return (
    <>
      <AnimatePresence>
        {showCheckout && (
          <StripeCheckoutModal
            course={course}
            price={price}
            onSuccess={handleSuccessPayment}
            onCancel={handleCancelPayment}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        style={{
          borderRadius: 22,
          background: `linear-gradient(135deg, rgba(78,91,146,0.06) 0%, rgba(78,91,146,0.02) 100%)`,
          border: "1.5px solid rgba(78,91,146,0.14)",
          padding: "28px 28px 26px",
          marginBottom: 20,
          boxShadow: "0 4px 24px rgba(78,91,146,0.07)",
        }}
      >
        <AnimatePresence>
          {paymentFailed && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                borderRadius: 14,
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.14)",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 28, height: 28, borderRadius: 9,
                  background: "rgba(239,68,68,0.10)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <X size={13} color="#EF4444" strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONT, fontSize: 13, color: "#DC2626", marginBottom: 1 }}>
                  لم تكتمل عملية الدفع
                </div>
                <div style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4" }}>
                  يمكنك المحاولة مرة أخرى في أي وقت
                </div>
              </div>
              <button
                onClick={() => setPaymentFailed(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#C4C9DE", padding: 0, flexShrink: 0 }}
              >
                <X size={13} strokeWidth={2} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>سعر الدورة</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              {isFree ? (
                <span style={{ fontFamily: FONT, fontSize: 32, color: "#15803D" }}>مجانية</span>
              ) : (
                <>
                  <span style={{ fontFamily: FONT, fontSize: 32, color: PRIMARY }}>${price}</span>
                  <span style={{ fontFamily: FONT, fontSize: 14, color: "#9BA3C4" }}>دفعة واحدة</span>
                </>
              )}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {[
              `${course.totalLessons} درس مُحكم`,
              `${course.totalDuration} من المحتوى`,
              "وصول دائم بلا انتهاء",
            ].map((feat) => (
              <div key={feat} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <ShieldCheck size={13} color={isFree ? "#15803D" : PRIMARY} strokeWidth={2} />
                <span style={{ fontFamily: FONT, fontSize: 12, color: "#6B7280" }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setPaymentFailed(false);
            setShowCheckout(true);
          }}
          style={{
            width: "100%",
            padding: "16px 24px",
            borderRadius: 16,
            background: isFree
              ? `linear-gradient(135deg, #22C55E 0%, #16A34A 100%)`
              : `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`,
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontSize: 17,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: isFree
              ? "0 6px 24px rgba(34,197,94,0.32)"
              : "0 6px 24px rgba(78,91,146,0.32)",
            transition: "transform 0.18s, box-shadow 0.18s",
          }}
        >
          <Sparkles size={18} strokeWidth={2} />
          {isFree ? "ابدأ التعلم مجاناً" : "اشترك الآن وابدأ التعلم"}
        </motion.button>

        <p style={{ fontFamily: FONT, fontSize: 11, color: "#B0B7D4", textAlign: "center", margin: "12px 0 0" }}>
          {isFree
            ? "وصول فوري — لا تحتاج إلى بطاقة ائتمانية"
            : "ضمان استرداد المبلغ خلال ٧ أيام · دفع آمن عبر Stripe"}
        </p>
      </motion.div>
    </>
  );
}
