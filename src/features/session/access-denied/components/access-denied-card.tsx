import { motion } from "motion/react";
import { ShieldOff, LogOut, AlertTriangle } from "lucide-react";
import { ManaraLogoIcon, ManaraLogoFull } from "@/shared/components/ManaraLogo";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

interface AccessDeniedCardProps {
  handleLogout: () => void;
}

export function AccessDeniedCard({ handleLogout }: AccessDeniedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#F2F3F9",
        backgroundImage: `
          radial-gradient(circle at 80% 8%,  rgba(78,91,146,0.07) 0%, transparent 52%),
          radial-gradient(circle at 10% 88%, rgba(78,91,146,0.05) 0%, transparent 48%)
        `,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        padding: "80px 24px 60px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute", top: "12%", left: "8%",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,24,61,0.05) 0%, transparent 70%)",
          filter: "blur(28px)", pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: "18%", right: "6%",
          width: 160, height: 160, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(78,91,146,0.07) 0%, transparent 70%)",
          filter: "blur(24px)", pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute", top: 32, left: 0, right: 0,
          display: "flex", justifyContent: "center",
        }}
      >
        <ManaraLogoFull size={30} color={PRIMARY} textColor={PRIMARY} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#FFFFFF",
          borderRadius: 28,
          boxShadow: "0 12px 48px rgba(78,91,146,0.10), 0 3px 10px rgba(78,91,146,0.06)",
          border: "1px solid rgba(78,91,146,0.08)",
          padding: "48px 44px 44px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 84,
            height: 84,
            borderRadius: 26,
            background: "rgba(212,24,61,0.06)",
            border: "1.5px solid rgba(212,24,61,0.13)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#D4183D",
            position: "relative",
          }}
        >
          <ShieldOff size={38} strokeWidth={1.4} />
          <div
            style={{
              position: "absolute",
              top: -6,
              left: -6,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#D4183D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              border: "2.5px solid #F2F3F9",
            }}
          >
            <AlertTriangle size={10} strokeWidth={2.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          <h1
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 22,
              color: "#1E2340",
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            ليس لديك صلاحية الوصول
          </h1>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 15,
              color: "#9BA3C4",
              lineHeight: 1.85,
              margin: 0,
            }}
          >
            لا يمكنك الوصول إلى هذه الصفحة
            <br />
            باستخدام حسابك الحالي.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.38, duration: 0.5 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(78,91,146,0.08)" }} />
          <ManaraLogoIcon size={16} color="rgba(78,91,146,0.22)" />
          <div style={{ flex: 1, height: 1, background: "rgba(78,91,146,0.08)" }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.4 }}
          style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}
        >
          <motion.button
            onClick={handleLogout}
            whileHover={{ y: -1, background: "rgba(78,91,146,0.05)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              width: "100%",
              padding: "13px 20px",
              borderRadius: 14,
              background: "transparent",
              color: "#9BA3C4",
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 14,
              border: "1.5px solid rgba(78,91,146,0.13)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.18s",
            }}
          >
            <LogOut size={15} strokeWidth={2} />
            تسجيل الخروج
          </motion.button>
        </motion.div>
      </motion.div>

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
