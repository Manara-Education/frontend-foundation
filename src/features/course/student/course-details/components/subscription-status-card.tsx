import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, X } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/course-details.formatter";
import type {
  CourseAccess,
  CourseDetailData,
  SubscriptionPlanOption,
} from "../types/course-details.types";
import { StripeCheckoutModal } from "./stripe-checkout-modal";

interface SubscriptionStatusCardProps {
  course: CourseDetailData;
  access: CourseAccess;
  plans: SubscriptionPlanOption[];
  onRenewed: () => void;
}

/**
 * A subscriber's standing on a course they are enrolled in — and, once the window closes,
 * the offer that reopens it.
 *
 * Ported from the reference `SubscriptionStatusCard`: the active and expiring-soon banners,
 * and the expired card with its plan selector and renew button. Which of the three shows is
 * `access.status`, which the backend decides — including how close to the end counts as
 * "soon", so this card never compares a date itself.
 *
 * Renewing is the same call as subscribing. It never touches the enrolment or anything
 * recorded against it, which is why a renewed learner resumes exactly where they stopped.
 */
export function SubscriptionStatusCard({
  course, access, plans, onRenewed,
}: SubscriptionStatusCardProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(
    // The plan their last window was bought under, so renewing offers back what they chose.
    access.planId ?? plans[0]?.id ?? null,
  );
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null;
  const isExpiringSoon = access.status === "EXPIRING_SOON";
  const isActive = access.status === "ACTIVE" || isExpiringSoon;

  function openCheckout() {
    setPaymentFailed(false);
    setShowCheckout(true);
  }

  const checkout = (
    <AnimatePresence>
      {showCheckout && selectedPlan && (
        <StripeCheckoutModal
          course={course}
          kind="subscription"
          amountLabel={selectedPlan.priceLabel}
          termsLabel={selectedPlan.name}
          planId={selectedPlan.id}
          onSuccess={() => { setShowCheckout(false); onRenewed(); }}
          onFailure={() => { setShowCheckout(false); setPaymentFailed(true); }}
          onCancel={() => { setShowCheckout(false); setPaymentFailed(true); }}
        />
      )}
    </AnimatePresence>
  );

  if (isActive) {
    return (
      <>
        {checkout}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          style={{
            borderRadius: 22, padding: "22px 24px", marginBottom: 20,
            background: isExpiringSoon ? "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%)" : "linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(34,197,94,0.02) 100%)",
            border: `1.5px solid ${isExpiringSoon ? "rgba(245,158,11,0.22)" : "rgba(34,197,94,0.20)"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: isExpiringSoon ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Star size={20} color={isExpiringSoon ? "#F59E0B" : "#22C55E"} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 15, color: isExpiringSoon ? "#92400E" : "#15803D" }}>
                {isExpiringSoon ? "اشتراكك ينتهي قريباً" : "اشتراكك نشط"}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: "#6B7280" }}>
                {access.daysRemaining !== null ? `متبقي ${access.daysRemaining} يوم` : ""} · ينتهي في {access.endDateLabel}
              </div>
            </div>
          </div>
          {isExpiringSoon && (
            <button
              onClick={openCheckout}
              style={{
                width: "100%", padding: "13px", borderRadius: 14,
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                color: "#fff", border: "none", cursor: "pointer",
                fontFamily: FONT, fontSize: 14, fontWeight: 700,
                boxShadow: "0 4px 16px rgba(245,158,11,0.30)",
              }}
            >
              تجديد الاشتراك
            </button>
          )}
        </motion.div>
      </>
    );
  }

  // Expired
  return (
    <>
      {checkout}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        style={{
          borderRadius: 22, padding: "24px 24px 20px", marginBottom: 20,
          background: "linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(239,68,68,0.02) 100%)",
          border: "1.5px solid rgba(239,68,68,0.18)",
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

        <div style={{ fontFamily: FONT, fontSize: 16, color: "#DC2626", marginBottom: 4 }}>انتهى اشتراكك</div>
        <div style={{ fontFamily: FONT, fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
          انتهى في {access.endDateLabel}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4", marginBottom: 20, lineHeight: 1.6 }}>
          جدّد اشتراكك لمتابعة التعلم من حيث توقفت.
        </div>

        {/* Plan selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {plans.map((plan) => (
            <label
              key={plan.id}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: 14, cursor: "pointer",
                border: `1.5px solid ${selectedPlanId === plan.id ? PRIMARY : "rgba(78,91,146,0.14)"}`,
                background: selectedPlanId === plan.id ? "rgba(78,91,146,0.06)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${selectedPlanId === plan.id ? PRIMARY : "rgba(78,91,146,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {selectedPlanId === plan.id && <div style={{ width: 9, height: 9, borderRadius: "50%", background: PRIMARY }} />}
              </div>
              <input type="radio" name="renewal-plan" value={plan.id} checked={selectedPlanId === plan.id} onChange={() => setSelectedPlanId(plan.id)} style={{ display: "none" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT, fontSize: 14, color: "#1F2937" }}>{plan.name}</div>
                <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>{plan.durationLabel}</div>
              </div>
              <div style={{ fontFamily: FONT, fontSize: 15, color: PRIMARY, fontWeight: 700 }}>{plan.priceLabel}</div>
            </label>
          ))}
        </div>

        <button
          onClick={openCheckout}
          style={{
            width: "100%", padding: "15px", borderRadius: 16,
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`,
            color: "#fff", border: "none", cursor: "pointer",
            fontFamily: FONT, fontSize: 16, fontWeight: 700,
            boxShadow: "0 6px 24px rgba(78,91,146,0.30)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          تجديد الاشتراك
        </button>
      </motion.div>
    </>
  );
}
