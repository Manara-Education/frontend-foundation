import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { FONT, PRIMARY, getGreeting } from "../formatters/courses.formatter";

export function WelcomeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 22,
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`,
        padding: "24px 28px",
        marginBottom: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 8px 32px rgba(78,91,146,0.22)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -28,
          left: -28,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -20,
          left: 60,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 5, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>👋</span>
          <span style={{ fontFamily: FONT, fontSize: 22, color: "#fff" }}>
            {getGreeting()}
          </span>
        </div>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: "rgba(255,255,255,0.72)",
            margin: 0,
            lineHeight: 1.65,
          }}
        >
          واصل رحلتك التعليمية — كل درس يقربك من هدفك القادم
        </p>
      </div>

      <div
        style={{
          flexShrink: 0,
          width: 52,
          height: 52,
          borderRadius: 16,
          background: "rgba(255,255,255,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Sparkles size={22} color="#fff" strokeWidth={1.8} />
      </div>
    </motion.div>
  );
}
