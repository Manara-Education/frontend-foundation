import { motion } from "motion/react";
import { useCounter } from "./use-counter";
import { PRIMARY, FONT, TEXT_DARK, TEXT_MUTE, BORDER } from "./theme";

interface AnalyticsCardProps {
  value: number;
  label: string;
  icon: React.ElementType;
  accentColor?: string;
  delay?: number;
}

export function AnalyticsCard({
  value,
  label,
  icon: Icon,
  accentColor = PRIMARY,
  delay = 0,
}: AnalyticsCardProps) {
  const count = useCounter(value, 1400);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="rs-longform"
      style={{
        background: "#ffffff",
        borderRadius: 24,
        padding: "clamp(22px, 4vw, 28px) clamp(20px, 4vw, 28px) clamp(21px, 4vw, 26px)",
        border: `1.5px solid ${BORDER}`,
        boxShadow: "0 2px 20px rgba(78,91,146,0.05)",
        minInlineSize: 0,
        maxInlineSize: "100%",
      }}
    >
      {/* Icon */}
      <div
        className="rounded-2xl flex items-center justify-center mb-6"
        style={{
          width: 48,
          height: 48,
          background: `${accentColor}12`,
          color: accentColor,
        }}
      >
        <Icon size={20} strokeWidth={1.8} />
      </div>

      {/* Number */}
      <div
        dir="ltr"
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 46,
          color: TEXT_DARK,
          lineHeight: 1,
          letterSpacing: 0,
          maxInlineSize: "100%",
        }}
      >
        {count}
      </div>

      {/* Label */}
      <div
        dir="rtl"
        style={{
          fontFamily: FONT,
          fontSize: 13.5,
          color: TEXT_MUTE,
          marginTop: 10,
          lineHeight: 1.5,
          minInlineSize: 0,
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}
