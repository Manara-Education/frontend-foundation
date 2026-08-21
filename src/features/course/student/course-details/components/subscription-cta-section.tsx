import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/course-details.formatter";
import type {
  CourseDetailData,
  SubscriptionPlanOption,
} from "../types/course-details.types";
import { StripeCheckoutModal } from "./stripe-checkout-modal";

interface SubscriptionCTASectionProps {
  course: CourseDetailData;
  plans: SubscriptionPlanOption[];
  onPay: () => void;
}

/**
 * The subscribe card a learner sees while browsing a `SUBSCRIPTION` course.
 *
 * Ported from the reference `SubscriptionCTASection`. The plans, their prices and their
 * lengths are the backend's, and only the selected plan's **id** is submitted — the amount
 * charged and the window opened are decided server-side from that same plan row.
 */
export function SubscriptionCTASection({ course, plans, onPay }: SubscriptionCTASectionProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(plans[0]?.id ?? null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;

  function handleCancelPayment() {
    setShowCheckout(false);
    setPaymentFailed(true);
  }

  function handleFailedPayment() {
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
        {showCheckout && selectedPlan && (
          <StripeCheckoutModal
            course={course}
            kind="subscription"
            amountLabel={selectedPlan.priceLabel}
            termsLabel={selectedPlan.name}
            planId={selectedPlan.id}
            onSuccess={handleSuccessPayment}
            onFailure={handleFailedPayment}
            onCancel={handleCancelPayment}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        style={{
          borderRadius: 22, padding: "28px 28px 24px", marginBottom: 20,
          background: "linear-gradient(135deg, rgba(78,91,146,0.06) 0%, rgba(78,91,146,0.02) 100%)",
          border: "1.5px solid rgba(78,91,146,0.14)",
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

        <div style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4", marginBottom: 8 }}>اختر مدة الوصول</div>

        {/* Plan cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {plans.map((plan) => (
            <label
              key={plan.id}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, cursor: "pointer",
                border: `2px solid ${selectedPlanId === plan.id ? PRIMARY : "rgba(78,91,146,0.12)"}`,
                background: selectedPlanId === plan.id ? "rgba(78,91,146,0.06)" : "#FFFFFF",
                transition: "all 0.15s",
                boxShadow: selectedPlanId === plan.id ? "0 0 0 3px rgba(78,91,146,0.10)" : "none",
              }}
            >
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${selectedPlanId === plan.id ? PRIMARY : "rgba(78,91,146,0.22)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {selectedPlanId === plan.id && <div style={{ width: 10, height: 10, borderRadius: "50%", background: PRIMARY }} />}
              </div>
              <input type="radio" name="sub-plan" value={plan.id} checked={selectedPlanId === plan.id} onChange={() => setSelectedPlanId(plan.id)} style={{ display: "none" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT, fontSize: 14, color: "#1F2937" }}>{plan.name}</div>
                <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>{plan.durationLabel}</div>
              </div>
              <div style={{ fontFamily: FONT, fontSize: 17, color: PRIMARY, fontWeight: 700 }}>
                {plan.priceLabel}
              </div>
            </label>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setPaymentFailed(false); setShowCheckout(true); }}
          style={{
            width: "100%", padding: "16px 24px", borderRadius: 16,
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`,
            color: "#fff", border: "none", cursor: "pointer",
            fontFamily: FONT, fontSize: 17,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "0 6px 24px rgba(78,91,146,0.32)",
          }}
        >
          <Sparkles size={18} strokeWidth={2} />
          اشترك الآن — {selectedPlan ? selectedPlan.priceLabel : ""}
        </motion.button>

        <p style={{ fontFamily: FONT, fontSize: 11, color: "#B0B7D4", textAlign: "center", margin: "12px 0 0" }}>
          دفع آمن · يمكنك تجديد الاشتراك في أي وقت
        </p>
      </motion.div>
    </>
  );
}
