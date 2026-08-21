import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Layers, Lock } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/course-details.formatter";
import type { CurriculumModule } from "../types/course-details.types";
import { BrowseLessonItem } from "./browse-lesson-item";

interface BrowseModuleGroupCardProps {
  module: CurriculumModule;
  index: number;
  enrolled: boolean;
}

export function BrowseModuleGroupCard({ module, index, enrolled }: BrowseModuleGroupCardProps) {
  const [open, setOpen] = useState(index === 0);
  const total = module.lessons.length;

  return (
    <div
      style={{
        borderRadius: 18,
        border: "1.5px solid #ECECEC",
        background: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          background: open ? "rgba(78,91,146,0.025)" : "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "right",
          transition: "background 0.18s",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 11,
            background: "rgba(78,91,146,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: PRIMARY,
          }}
        >
          <Layers size={15} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 14,
              color: "#1F2937",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {module.title}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4", marginTop: 2 }}>
            {total} درس {enrolled ? "" : "· مقفل"}
          </div>
        </div>
        {!enrolled && <Lock size={13} color="#C4C9DE" strokeWidth={2} style={{ flexShrink: 0 }} />}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown size={15} strokeWidth={2} style={{ color: "#9BA3C4" }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="bl"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              {module.lessons.map((lesson, i) => (
                <BrowseLessonItem key={lesson.id} lesson={lesson} index={i} enrolled={enrolled} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
