import { motion } from "motion/react";
import { BookOpen, Plus } from "lucide-react";
import { PRIMARY, FONT, TEXT_DARK, TEXT_MUTE } from "./theme";

interface EmptyCoursesProps {
  onCreateCourse?: () => void;
}

export function EmptyCourses({ onCreateCourse }: EmptyCoursesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center py-16 px-8"
      style={{
        background: "#ffffff",
        borderRadius: 24,
        border: `1.5px dashed rgba(78,91,146,0.18)`,
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
        className="rounded-3xl flex items-center justify-center mb-6"
        style={{ width: 72, height: 72, background: "rgba(78,91,146,0.07)" }}
      >
        <BookOpen size={28} style={{ color: PRIMARY }} strokeWidth={1.6} />
      </motion.div>

      <h3
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 18,
          color: TEXT_DARK,
        }}
      >
        لم تقم بإنشاء أي دورة بعد
      </h3>
      <p
        style={{
          fontFamily: FONT,
          fontSize: 13.5,
          color: TEXT_MUTE,
          marginTop: 8,
          maxWidth: 300,
          lineHeight: 1.8,
        }}
      >
        ابدأ في مشاركة معرفتك مع طلابك من خلال إنشاء دورتك الأولى
      </p>

      <motion.button
        onClick={onCreateCourse}
        whileHover={{ y: -2, boxShadow: "0 10px 28px rgba(78,91,146,0.28)" }}
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
          boxShadow: "0 4px 18px rgba(78,91,146,0.24)",
        }}
      >
        <Plus size={16} strokeWidth={2.5} />
        إنشاء دورة جديدة
      </motion.button>
    </motion.div>
  );
}
