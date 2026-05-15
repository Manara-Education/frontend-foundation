import { useState } from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";
import type { EnrolledCourse } from "../types/home.types";

const PRIMARY = "#4E5B92";

export function EnrolledCard({ course }: { course: EnrolledCourse }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-shrink-0 flex flex-col overflow-hidden cursor-pointer"
      style={{
        width: 210,
        borderRadius: 18,
        background: "#ffffff",
        border: `1.5px solid ${hovered ? "rgba(78,91,146,0.2)" : "rgba(78,91,146,0.08)"}`,
        boxShadow: hovered ? "0 8px 24px rgba(78,91,146,0.13)" : "0 2px 10px rgba(78,91,146,0.06)",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
    >
      <div className="relative overflow-hidden" style={{ height: 116 }}>
        <ImageWithFallback src={course.image} alt={course.title} className="w-full h-full object-cover" style={{ transition: "transform 0.3s", transform: hovered ? "scale(1.05)" : "scale(1)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(14,18,42,0.45) 100%)" }} />
        <div className="absolute top-2.5 right-2.5 rounded-lg px-2 py-0.5" style={{ background: course.tagColor, fontFamily: "'Cairo', sans-serif", color: "#fff", fontSize: 10, fontWeight: 600 }}>
          {course.tag}
        </div>
      </div>
      <div className="p-3.5 flex flex-col gap-2 flex-1" dir="rtl">
        <div>
          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, color: "#1E2340", lineHeight: 1.5 }}>{course.title}</div>
          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 400, fontSize: 11, color: "#9BA3C4", marginTop: 2 }}>{course.subtitle}</div>
        </div>
        <div className="flex flex-col gap-1 mt-auto">
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 10, color: "#9BA3C4" }}>{course.lessons} درس</span>
            <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 11, color: PRIMARY }}>{course.progress}٪</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: "rgba(78,91,146,0.1)" }}>
            <div className="h-full rounded-full" style={{ width: `${course.progress}%`, background: `linear-gradient(90deg, ${PRIMARY} 0%, #6B7AB8 100%)` }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
