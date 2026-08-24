import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Sparkles } from "lucide-react";
import { PRIMARY, FONT, TEXT_DARK, TEXT_MID } from "./theme";

interface CreateCourseBannerProps {
  onCreateCourse?: () => void;
}

export function CreateCourseBanner({ onCreateCourse }: CreateCourseBannerProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.22 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(140deg, #EEF0FA 0%, #E6E9F7 60%, #EBE8F8 100%)",
        borderRadius: 28,
        padding: "44px 44px 44px",
        border: `1.5px solid rgba(78,91,146,0.13)`,
        boxShadow: hovered
          ? "0 16px 48px rgba(78,91,146,0.13)"
          : "0 4px 24px rgba(78,91,146,0.07)",
        transition: "box-shadow 0.35s",
      }}
    >
      {/* ── Decorative geometry ───────────────────────── */}
      <svg
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "46%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.55,
        }}
        viewBox="0 0 260 180"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Outer rings */}
        <circle cx="30" cy="90" r="150" stroke={PRIMARY} strokeWidth="0.7" strokeOpacity="0.25" />
        <circle cx="30" cy="90" r="110" stroke={PRIMARY} strokeWidth="0.8" strokeOpacity="0.3" />
        <circle cx="30" cy="90" r="72" stroke={PRIMARY} strokeWidth="1" strokeOpacity="0.35" />
        <circle cx="30" cy="90" r="38" stroke={PRIMARY} strokeWidth="1.2" strokeOpacity="0.25" />
        {/* Filled dot */}
        <circle cx="30" cy="90" r="8" fill={PRIMARY} fillOpacity="0.12" />
        {/* Accent arc top-right */}
        <circle cx="220" cy="-20" r="80" stroke={PRIMARY} strokeWidth="0.6" strokeOpacity="0.15" />
        {/* Accent arc bottom-left */}
        <circle cx="-10" cy="200" r="70" stroke={PRIMARY} strokeWidth="0.6" strokeOpacity="0.15" />
      </svg>

      {/* ── Content ───────────────────────────────────── */}
      <div className="relative flex items-center justify-between" dir="rtl">
        {/* Text */}
        <div className="flex flex-col gap-4" style={{ maxWidth: 420 }}>
          {/* Label pill */}
          <div
            className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 w-fit"
            style={{
              background: "rgba(78,91,146,0.1)",
              border: "1px solid rgba(78,91,146,0.12)",
            }}
          >
            <Sparkles size={12} style={{ color: PRIMARY }} />
            <span
              style={{
                fontFamily: FONT,
                fontSize: 11.5,
                fontWeight: 600,
                color: PRIMARY,
                letterSpacing: 0.4,
              }}
            >
              منارة · ابدأ بالتدريس
            </span>
          </div>

          {/* Quote */}
          <div>
            <h2
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 24,
                color: TEXT_DARK,
                lineHeight: 1.45,
              }}
            >
              شارك علمك…
            </h2>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 16,
                color: TEXT_MID,
                lineHeight: 1.75,
                marginTop: 4,
              }}
            >
              هناك دائمًا من ينتظر أن يتعلم منك.
            </p>
          </div>

          {/* CTA */}
          <motion.button
            onClick={onCreateCourse}
            whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(78,91,146,0.34)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="flex items-center gap-2.5 rounded-2xl px-6 py-3 w-fit mt-1"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 6px 20px rgba(78,91,146,0.28)",
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            إنشاء دورة جديدة
          </motion.button>
        </div>

        {/* Right illustration block (abstract minimal) */}
        <div
          className="flex-shrink-0 hidden md:flex items-center justify-center"
          style={{
            width: 130,
            height: 130,
            opacity: hovered ? 0.9 : 0.6,
            transition: "opacity 0.3s",
          }}
        >
          <svg viewBox="0 0 120 120" fill="none" width={120} height={120}>
            {/* Book-like abstract shape */}
            <rect
              x="20"
              y="28"
              width="80"
              height="64"
              rx="10"
              fill={PRIMARY}
              fillOpacity="0.08"
              stroke={PRIMARY}
              strokeOpacity="0.2"
              strokeWidth="1.5"
            />
            <rect x="28" y="36" width="64" height="8" rx="4" fill={PRIMARY} fillOpacity="0.22" />
            <rect x="28" y="50" width="48" height="6" rx="3" fill={PRIMARY} fillOpacity="0.14" />
            <rect x="28" y="62" width="56" height="6" rx="3" fill={PRIMARY} fillOpacity="0.14" />
            <rect x="28" y="74" width="36" height="6" rx="3" fill={PRIMARY} fillOpacity="0.1" />
            {/* Sparkle dots */}
            <circle cx="92" cy="26" r="5" fill={PRIMARY} fillOpacity="0.18" />
            <circle cx="100" cy="18" r="3" fill={PRIMARY} fillOpacity="0.12" />
            <circle cx="84" cy="19" r="2" fill={PRIMARY} fillOpacity="0.16" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
