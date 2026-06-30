import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PlayCircle,
  Pencil,
  Trash2,
  GripVertical,
  Video,
  Clock3,
} from "lucide-react";
import type { Lesson } from "../types/add-lessons.types";
import { extractYouTubeId, getYouTubeThumbnail, formatLessonDurationLabel } from "../formatters/add-lessons.formatter";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

export function LessonCard({ lesson, index, onEdit, onDelete, isDragging }: LessonCardProps) {
  const [hovered, setHovered] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
      style={{
        background: "#ffffff",
        borderRadius: 18,
        border: `1.5px solid ${isDragging ? PRIMARY + "40" : hovered ? "rgba(78,91,146,0.18)" : "rgba(78,91,146,0.09)"}`,
        boxShadow: isDragging
          ? "0 16px 48px rgba(78,91,146,0.2)"
          : hovered
          ? "0 6px 24px rgba(78,91,146,0.1)"
          : "0 2px 8px rgba(78,91,146,0.05)",
        transition: "box-shadow 0.2s, border-color 0.2s",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      <div className="flex items-stretch" dir="rtl">
        <div
          className="flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing"
          style={{ width: 36, background: hovered ? "rgba(78,91,146,0.03)" : "transparent", transition: "background 0.15s" }}
        >
          <GripVertical size={15} style={{ color: hovered ? "#9BA3C4" : "#D0D4E8", transition: "color 0.15s" }} />
        </div>

        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40 }}>
          <div
            className="rounded-xl flex items-center justify-center"
            style={{ width: 28, height: 28, background: "rgba(78,91,146,0.08)", color: PRIMARY, fontFamily: FONT, fontWeight: 700, fontSize: 12 }}
          >
            {index + 1}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center py-3 pl-3">
          <div
            className="relative overflow-hidden"
            style={{ width: 112, height: 68, borderRadius: 12, background: "#0F1322", flexShrink: 0 }}
          >
            <img
              src={getYouTubeThumbnail(extractYouTubeId(lesson.videoUrl ?? "") ?? "")}
              alt={lesson.title}
              onLoad={() => setThumbLoaded(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: thumbLoaded ? 1 : 0, transition: "opacity 0.3s" }}
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
              <div
                className="rounded-full flex items-center justify-center"
                style={{ width: 30, height: 30, background: "rgba(0,0,0,0.5)", opacity: thumbLoaded ? 1 : 0, transition: "opacity 0.3s" }}
              >
                <PlayCircle size={16} color="#fff" />
              </div>
            </div>
            {!thumbLoaded && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1f3c 0%, #2d3563 100%)" }}>
                <Video size={18} color="rgba(255,255,255,0.25)" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center py-3 pr-2">
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: "#1E2340", lineHeight: 1.4 }}>
            {lesson.title}
          </div>
          {lesson.description && (
            <div
              style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", marginTop: 3, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}
            >
              {lesson.description}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="rounded-md px-2 py-0.5 flex items-center gap-1" style={{ background: "rgba(78,91,146,0.07)" }}>
              <Clock3 size={10} color={PRIMARY} />
              <span style={{ fontFamily: FONT, fontSize: 10, color: PRIMARY, fontWeight: 600 }}>
                {formatLessonDurationLabel(lesson.duration)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 px-3 flex-shrink-0">
          <AnimatePresence mode="wait">
            {confirmDelete ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                style={{ background: "rgba(212,24,61,0.07)", border: "1px solid rgba(212,24,61,0.15)" }}
              >
                <span style={{ fontFamily: FONT, fontSize: 11.5, color: "#D4183D", fontWeight: 600 }}>حذف؟</span>
                <button
                  onClick={onDelete}
                  className="rounded-lg px-2 py-0.5 transition-colors"
                  style={{ background: "#D4183D", color: "#fff", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 11, fontWeight: 700 }}
                >
                  نعم
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg px-2 py-0.5 transition-colors"
                  style={{ background: "rgba(78,91,146,0.1)", color: PRIMARY, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 11, fontWeight: 600 }}
                >
                  لا
                </button>
              </motion.div>
            ) : (
              <motion.div key="btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="flex items-center gap-1">
                <button
                  onClick={onEdit}
                  title="تعديل"
                  className="rounded-xl flex items-center justify-center transition-all"
                  style={{ width: 34, height: 34, background: hovered ? "rgba(78,91,146,0.08)" : "transparent", color: hovered ? PRIMARY : "#C4C9DC", border: "none", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(78,91,146,0.12)"; e.currentTarget.style.color = PRIMARY; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = hovered ? "rgba(78,91,146,0.08)" : "transparent"; e.currentTarget.style.color = hovered ? PRIMARY : "#C4C9DC"; }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  title="حذف"
                  className="rounded-xl flex items-center justify-center transition-all"
                  style={{ width: 34, height: 34, background: "transparent", color: "#C4C9DC", border: "none", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,24,61,0.08)"; e.currentTarget.style.color = "#D4183D"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C4C9DC"; }}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
