import { Link } from "react-router";
import { motion } from "motion/react";
import { Compass, Home } from "lucide-react";
import { ManaraLogoFull, ManaraLogoIcon } from "@/shared/components/ManaraLogo";
import { useAuth } from "@/shared/auth";
import { homePathForRole, paths } from "@/shared/navigation";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

/**
 * The answer to a URL the application does not have.
 *
 * It offers a way onward rather than only stating the problem, and the way onward depends
 * on who is asking: a signed-in visitor is sent to their own area, everyone else to the
 * public front door. Nothing here redirects on its own — the address that was typed stays
 * in the bar, so a mistyped link can be seen and corrected.
 */
export function NotFoundPage() {
  const { status, user } = useAuth();
  const isSignedIn = status === "authenticated";
  const homeTo = isSignedIn ? homePathForRole(user?.role) : paths.landing;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
          position: "absolute", top: 32, left: 0, right: 0,
          display: "flex", justifyContent: "center",
        }}
      >
        <Link to={paths.landing} style={{ textDecoration: "none" }}>
          <ManaraLogoFull size={30} color={PRIMARY} textColor={PRIMARY} />
        </Link>
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
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 26,
            background: "rgba(78,91,146,0.06)",
            border: "1.5px solid rgba(78,91,146,0.13)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: PRIMARY,
          }}
        >
          <Compass size={38} strokeWidth={1.4} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: "#1E2340", lineHeight: 1.4, margin: 0 }}>
            الصفحة غير موجودة
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 15, color: "#9BA3C4", lineHeight: 1.85, margin: 0 }}>
            الرابط الذي فتحته لم يعد متاحاً
            <br />
            أو ربما تغيّر عنوانه.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(78,91,146,0.08)" }} />
          <ManaraLogoIcon size={16} color="rgba(78,91,146,0.22)" />
          <div style={{ flex: 1, height: 1, background: "rgba(78,91,146,0.08)" }} />
        </div>

        <Link
          to={homeTo}
          style={{
            width: "100%",
            padding: "13px 20px",
            borderRadius: 14,
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`,
            color: "#FFFFFF",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(78,91,146,0.22)",
          }}
        >
          <Home size={15} strokeWidth={2} />
          {isSignedIn ? "العودة إلى الصفحة الرئيسية" : "العودة إلى منارة"}
        </Link>
      </motion.div>

      <div
        style={{
          position: "absolute",
          bottom: 28,
          fontFamily: FONT,
          fontSize: 12,
          color: "#C4CADF",
        }}
      >
        © ٢٠٢٦ منارة — جميع الحقوق محفوظة
      </div>
    </motion.div>
  );
}
