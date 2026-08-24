import { motion } from "motion/react";
import { FONT, PRIMARY } from "./editor-theme";

interface SectionCardProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}

/** The white panel every step of the create wizard is drawn inside. */
export function SectionCard({ icon: Icon, title, subtitle, children, delay = 0 }: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay }}
      className="mb-5"
      style={{
        background: "#ffffff",
        borderRadius: 24,
        padding: "28px 32px 32px",
        border: "1.5px solid rgba(78,91,146,0.09)",
        boxShadow: "0 4px 32px rgba(78,91,146,0.08)",
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ width: 40, height: 40, background: "rgba(78,91,146,0.1)", color: PRIMARY }}
        >
          <Icon size={18} />
        </div>
        <div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: "#1E2340" }}>{title}</div>
          {subtitle && (
            <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", marginTop: 2 }}>{subtitle}</div>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

interface ModalSectionProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

/** The course editor's panel — same idea, the tabs' spacing. */
export function ModalSection({ title, subtitle, icon: Icon, children }: ModalSectionProps) {
  return (
    <div
      style={{
        borderRadius: 18,
        background: "#fff",
        border: "1.5px solid rgba(78,91,146,0.1)",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            background: "rgba(78,91,146,0.09)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: PRIMARY,
            flexShrink: 0,
          }}
        >
          <Icon size={16} strokeWidth={1.9} />
        </div>
        <div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14.5, color: "#1E2340" }}>{title}</div>
          {subtitle && (
            <div style={{ fontFamily: FONT, fontSize: 11.5, color: "#9BA3C4", marginTop: 1 }}>{subtitle}</div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
