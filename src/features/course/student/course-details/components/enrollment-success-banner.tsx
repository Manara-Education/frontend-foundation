import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { FONT } from "../formatters/course-details.formatter";

export function EnrollmentSuccessBanner({ isFree }: { isFree: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 18,
        background: "linear-gradient(135deg, rgba(34,197,94,0.10) 0%, rgba(34,197,94,0.04) 100%)",
        border: "1.5px solid rgba(34,197,94,0.22)",
        padding: "18px 22px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: "rgba(34,197,94,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <CheckCircle2 size={22} color="#15803D" strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 15, color: "#15803D", marginBottom: 2 }}>
          {isFree ? "تم التسجيل بنجاح! 🎉" : "تم الاشتراك بنجاح! 🎉"}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 12, color: "#6B7280" }}>
          جميع الدروس متاحة الآن — ابدأ رحلتك التعليمية
        </div>
      </div>
    </motion.div>
  );
}
