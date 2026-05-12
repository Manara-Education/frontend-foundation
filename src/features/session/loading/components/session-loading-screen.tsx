import { motion } from "motion/react";
import { ManaraLogoIcon, ManaraLogoFull } from "@/shared/components/ManaraLogo";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

function LoadingDots() {
  return (
    <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.25, 1, 0.25],
          }}
          transition={{
            duration: 1.3,
            repeat: Infinity,
            delay: i * 0.22,
            ease: "easeInOut",
          }}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: PRIMARY,
          }}
        />
      ))}
    </div>
  );
}

function PulseRing() {
  return (
    <>
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.07, 0.2] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: -22,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${PRIMARY}55 0%, transparent 68%)`,
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.14, 1], opacity: [0.3, 0.12, 0.3] }}
        transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        style={{
          position: "absolute",
          inset: -10,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${PRIMARY}40 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

export function SessionLoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      dir="rtl"
      style={{
        position: "fixed",
        inset: 0,
        background: "#F2F3F9",
        backgroundImage: `
          radial-gradient(circle at 78% 12%, rgba(78,91,146,0.08) 0%, transparent 52%),
          radial-gradient(circle at 12% 85%, rgba(78,91,146,0.06) 0%, transparent 48%)
        `,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        zIndex: 9999,
        userSelect: "none",
      }}
    >
      <motion.div
        animate={{ y: [0, -14, 0], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "18%",
          right: "14%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(78,91,146,0.12) 0%, transparent 70%)`,
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ y: [0, 12, 0], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{
          position: "absolute",
          bottom: "22%",
          left: "10%",
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(78,91,146,0.10) 0%, transparent 70%)`,
          filter: "blur(24px)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        style={{
          position: "absolute",
          top: 32,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ManaraLogoFull size={30} color={PRIMARY} textColor={PRIMARY} />
      </motion.div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <div style={{ position: "relative" }}>
          <PulseRing />
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "relative",
              width: 100,
              height: 100,
              borderRadius: 30,
              background: "#FFFFFF",
              boxShadow: `
                0 12px 40px rgba(78,91,146,0.14),
                0 4px 12px rgba(78,91,146,0.08),
                0 0 0 1px rgba(78,91,146,0.09)
              `,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ManaraLogoIcon size={54} color={PRIMARY} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span
            style={{
              fontFamily: FONT,
              fontSize: 16,
              fontWeight: 600,
              color: "#1E2340",
              letterSpacing: 0.2,
            }}
          >
            جاري التحقق من الجلسة...
          </span>
          <LoadingDots />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.55 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: 220,
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(78,91,146,0.10)" }} />
          <ManaraLogoIcon size={14} color="rgba(78,91,146,0.22)" />
          <div style={{ flex: 1, height: 1, background: "rgba(78,91,146,0.10)" }} />
        </motion.div>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            fontFamily: FONT,
            fontSize: 12,
            color: "#B0B7D4",
            letterSpacing: 0.4,
            marginTop: -10,
          }}
        >
          منصة التعلم العربية
        </motion.span>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        style={{
          position: "absolute",
          bottom: 28,
          fontFamily: FONT,
          fontSize: 12,
          color: "#C4CADF",
        }}
      >
        © ٢٠٢٦ منارة — جميع الحقوق محفوظة
      </motion.div>
    </motion.div>
  );
}
