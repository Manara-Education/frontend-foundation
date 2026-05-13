import { motion } from "motion/react";
import { PlayCircle, Plus } from "lucide-react";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

export function EmptyLessons({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col items-center justify-center text-center py-16 px-8"
      style={{
        background: "#ffffff",
        borderRadius: 24,
        border: "1.5px dashed rgba(78,91,146,0.2)",
      }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
        className="rounded-3xl flex items-center justify-center mb-5"
        style={{ width: 72, height: 72, background: "rgba(78,91,146,0.08)" }}
      >
        <PlayCircle size={30} style={{ color: PRIMARY }} />
      </motion.div>
      <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 17, color: "#1E2340" }}>
        لم تقم بإضافة أي دروس بعد
      </h3>
      <p style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4", marginTop: 6, maxWidth: 300, lineHeight: 1.75 }}>
        ابدأ بإضافة درسك الأول وربطه بفيديو YouTube — يمكنك إضافة المزيد لاحقاً
      </p>
      <motion.button
        onClick={onAdd}
        whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(78,91,146,0.28)" }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-2 mt-7 rounded-2xl px-6 py-3"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 14,
          boxShadow: "0 4px 16px rgba(78,91,146,0.25)",
        }}
      >
        <Plus size={16} />
        إضافة درس جديد
      </motion.button>
    </motion.div>
  );
}
