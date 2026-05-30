import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Lock, ChevronDown } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/course-details.formatter";
import type { Lesson } from "../types/course-details.types";
import { BrowseLessonItem } from "./browse-lesson-item";

interface BrowseCurriculumSectionProps {
  lessons: Lesson[];
  enrolled: boolean;
}

export function BrowseCurriculumSection({ lessons, enrolled }: BrowseCurriculumSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? lessons : lessons.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3 }}
      style={{ marginBottom: 20 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: "rgba(78,91,146,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: PRIMARY,
            }}
          >
            <BookOpen size={15} strokeWidth={1.8} />
          </div>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 16, color: "#1F2937" }}>منهج الدورة</div>
            <div style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4" }}>
              {lessons.length} درس {enrolled ? "— جميعها متاحة" : "— مقفلة حتى الاشتراك"}
            </div>
          </div>
        </div>
        {!enrolled && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 99, background: "rgba(196,201,222,0.10)", border: "1px solid rgba(196,201,222,0.20)" }}>
            <Lock size={11} color="#C4C9DE" strokeWidth={2} />
            <span style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4" }}>الكل مقفل</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AnimatePresence>
          {displayed.map((lesson, i) => (
            <BrowseLessonItem key={lesson.id} lesson={lesson} index={i} enrolled={enrolled} />
          ))}
        </AnimatePresence>
      </div>

      {lessons.length > 8 && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAll(!showAll)}
          style={{
            width: "100%", marginTop: 10, padding: "12px", borderRadius: 14,
            background: "transparent", border: "1.5px solid #ECECEC",
            cursor: "pointer", fontFamily: FONT, fontSize: 13, color: "#9BA3C4",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all 0.18s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(78,91,146,0.25)";
            e.currentTarget.style.color = PRIMARY;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#ECECEC";
            e.currentTarget.style.color = "#9BA3C4";
          }}
        >
          <motion.div animate={{ rotate: showAll ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={15} strokeWidth={2} />
          </motion.div>
          {showAll ? "عرض أقل" : `عرض ${lessons.length - 8} دروس إضافية`}
        </motion.button>
      )}
    </motion.div>
  );
}
