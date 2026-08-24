import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";
const TEXT_DARK = "#1A1F3C";
const TEXT_MID = "#6B708A";

interface HeaderSectionProps {
  totalCount: number;
  onBack?: () => void;
}

export function HeaderSection({ totalCount, onBack }: HeaderSectionProps) {
  return (
    <section className="mb-9">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: 6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.04 }}
        onClick={onBack}
        className="flex items-center gap-1.5 mb-5"
        style={{
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 500,
          color: TEXT_MID,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          outline: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)}
        onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MID)}
      >
        <ArrowRight size={15} strokeWidth={2} />
        العودة للرئيسية
      </motion.button>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
      >
        <h1
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 28,
            color: TEXT_DARK,
            lineHeight: 1.3,
            letterSpacing: -0.3,
          }}
        >
          دوراتي
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 14.5,
            color: TEXT_MID,
            marginTop: 6,
            lineHeight: 1.7,
          }}
        >
          قم بإدارة وتعديل جميع الدورات الخاصة بك
        </p>
      </motion.div>

      {/* Stats pills */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="flex items-center gap-2.5 mt-5 flex-wrap"
      >
        {[{ label: `${totalCount} دورة`, bg: "rgba(78,91,146,0.07)", color: PRIMARY }].map((pill) => (
          <div
            key={pill.label}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{ background: pill.bg, border: `1px solid ${pill.color}18` }}
          >
            <div
              className="rounded-full flex-shrink-0"
              style={{ width: 5, height: 5, background: pill.color }}
            />
            <span
              style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: pill.color }}
            >
              {pill.label}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
