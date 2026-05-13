import { useState } from "react";
import { motion } from "motion/react";
import { Star, Clock } from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";
import type { RecommendedCourse } from "../types/home.types";

const PRIMARY = "#4E5B92";

export function RecommendCard({ course }: { course: RecommendedCourse }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col overflow-hidden cursor-pointer"
      style={{
        borderRadius: 18,
        background: "#ffffff",
        border: `1.5px solid ${hovered ? "rgba(78,91,146,0.2)" : "rgba(78,91,146,0.08)"}`,
        boxShadow: hovered ? "0 8px 24px rgba(78,91,146,0.12)" : "0 2px 10px rgba(78,91,146,0.05)",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
    >
      <div className="relative overflow-hidden" style={{ height: 140 }}>
        <ImageWithFallback src={course.image} alt={course.title} className="w-full h-full object-cover" style={{ transition: "transform 0.3s", transform: hovered ? "scale(1.04)" : "scale(1)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(14,18,42,0.05) 0%, rgba(14,18,42,0.55) 100%)" }} />
        <div className="absolute bottom-2.5 right-2.5 rounded-lg px-2 py-0.5" style={{ background: course.levelColor, fontFamily: "'Cairo', sans-serif", color: "#fff", fontSize: 10, fontWeight: 600 }}>
          {course.level}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2.5 flex-1" dir="rtl">
        <div>
          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, color: "#1E2340", lineHeight: 1.5 }}>{course.title}</div>
          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 400, fontSize: 12, color: "#717182", marginTop: 3, lineHeight: 1.7 }}>{course.desc}</div>
        </div>
        <div className="flex items-center gap-4 mt-auto">
          <div className="flex items-center gap-1">
            <Star size={12} fill="#E8A020" color="#E8A020" />
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, fontWeight: 600, color: "#4A4A6A" }}>{course.rating}</span>
          </div>
          <div className="flex items-center gap-1" style={{ color: "#9BA3C4" }}>
            <Clock size={12} />
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11 }}>{course.hours} ساعة</span>
          </div>
        </div>
        <button
          className="w-full rounded-xl py-2 transition-all duration-150"
          style={{
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 600,
            fontSize: 12,
            background: hovered ? PRIMARY : "rgba(78,91,146,0.07)",
            color: hovered ? "#fff" : PRIMARY,
            border: "none",
            cursor: "pointer",
          }}
        >
          عرض الدورة
        </button>
      </div>
    </motion.div>
  );
}
