import { motion, AnimatePresence } from "motion/react";
import { Lock, X, CheckCircle2, ShieldCheck } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/course-details.formatter";
import { useCheckout } from "../hooks/use-checkout";
import type { CourseDetailData } from "../types/course-details.types";
import { StripeField } from "./stripe-field";

interface StripeCheckoutModalProps {
  course: CourseDetailData;
  price: number | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripeCheckoutModal({ course, price, onSuccess, onCancel }: StripeCheckoutModalProps) {
  const isFree = price === null;
  const {
    step, form, canPay,
    setCardNumber, setExpiry, setCvc, setName, setEmail, handlePay,
  } = useCheckout({ courseId: course.id, isFree, onSuccess });

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
        padding: 20,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        dir="rtl"
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 24,
          background: "#FFFFFF",
          boxShadow: "0 40px 100px rgba(10,13,40,0.30), 0 8px 32px rgba(10,13,40,0.14)",
          overflow: "hidden",
        }}
      >
        <div style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`, padding: "22px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lock size={16} color="#fff" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 11, color: "rgba(255,255,255,0.70)", marginBottom: 2 }}>دفع آمن عبر Stripe</div>
                <div style={{ fontFamily: FONT, fontSize: 14, color: "#fff", lineHeight: 1.35 }}>{course.title}</div>
              </div>
            </div>
            {step === "form" && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={onCancel}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: "none", background: "rgba(255,255,255,0.16)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                  flexShrink: 0,
                }}
              >
                <X size={14} strokeWidth={2.5} />
              </motion.button>
            )}
          </div>
          <div style={{ marginTop: 18, display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: FONT, fontSize: 38, color: "#fff", lineHeight: 1 }}>
              {isFree ? "مجانية" : `$${price}`}
            </span>
            {!isFree && (
              <span style={{ fontFamily: FONT, fontSize: 13, color: "rgba(255,255,255,0.62)" }}>USD · دفعة واحدة</span>
            )}
          </div>
        </div>

        <div style={{ padding: "24px 24px 20px" }}>
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                {isFree ? (
                  <div style={{ textAlign: "center", padding: "12px 0 20px" }}>
                    <div style={{ fontFamily: FONT, fontSize: 15, color: "#1F2937", marginBottom: 8 }}>دورة مجانية بالكامل</div>
                    <p style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4", lineHeight: 1.7, margin: 0 }}>
                      انقر أدناه للحصول على وصول فوري ومجاني لجميع الدروس
                    </p>
                  </div>
                ) : (
                  <>
                    <StripeField label="البريد الإلكتروني" placeholder="you@example.com" value={form.email} onChange={setEmail} type="email" />
                    <StripeField label="رقم البطاقة" placeholder="1234 5678 9012 3456" value={form.cardNumber} onChange={setCardNumber} showCardIcon />
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <StripeField label="تاريخ الانتهاء" placeholder="MM / YY" value={form.expiry} onChange={setExpiry} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <StripeField label="رمز CVC" placeholder="•••" value={form.cvc} onChange={setCvc} type="password" />
                      </div>
                    </div>
                    <StripeField label="الاسم على البطاقة" placeholder="اسمك الكامل" value={form.name} onChange={setName} />
                  </>
                )}

                <motion.button
                  whileHover={canPay ? { scale: 1.015 } : {}}
                  whileTap={canPay ? { scale: 0.98 } : {}}
                  onClick={canPay ? handlePay : undefined}
                  style={{
                    width: "100%",
                    padding: "15px 20px",
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
                    marginTop: isFree ? 0 : 4,
                  }}
                >
                  <Lock size={15} strokeWidth={2} />
                  {isFree ? "ابدأ التعلم مجاناً" : `ادفع $${price} وابدأ التعلم`}
                </motion.button>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 14 }}>
                  <button
                    onClick={onCancel}
                    style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    إلغاء
                  </button>
                  <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#D1D5DB" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <ShieldCheck size={12} color="#B0B7D4" strokeWidth={2} />
                    <span style={{ fontFamily: FONT, fontSize: 11, color: "#B0B7D4" }}>مشفّر ومحمي بـ Stripe</span>
                  </div>
                </div>
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
            style={{
              padding: "11px 24px",
              borderTop: "1px solid #F3F4F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Lock size={10} color="#C4C9DE" strokeWidth={2} />
            <span style={{ fontFamily: FONT, fontSize: 10, color: "#C4C9DE" }}>Powered by Stripe · SSL Secured · PCI Compliant</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
