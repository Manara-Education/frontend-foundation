import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Layers, Lock } from "lucide-react";
import { FONT, PRIMARY, SUCCESS } from "../formatters/course-details.formatter";
import type { CurriculumModule } from "../types/course-details.types";
import { ExamItem } from "./exam-item";
import { ExamPanel } from "./exam-panel";
import { LessonItem } from "./lesson-item";

interface ModuleGroupCardProps {
  courseId: number;
  module: CurriculumModule;
  index: number;
  defaultOpen?: boolean;
  openExamQuizId: string | null;
  onLessonClick?: (id: number) => void;
  onToggleExam: (quizId: string) => void;
  onProgressionChanged: () => void;
}

export function ModuleGroupCard({
  courseId,
  module,
  index,
  defaultOpen = false,
  openExamQuizId,
  onLessonClick,
  onToggleExam,
  onProgressionChanged,
}: ModuleGroupCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const completed = module.lessons.filter((l) => l.status === "completed").length;
  const total = module.lessons.length;
  const hasCurrent = module.lessons.some((l) => l.status === "current");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      style={{
        borderRadius: 18,
        border: `1.5px solid ${hasCurrent ? "rgba(78,91,146,0.22)" : "#ECECEC"}`,
        background: "#FFFFFF",
        overflow: "hidden",
        boxShadow: hasCurrent ? "0 2px 16px rgba(78,91,146,0.07)" : "none",
        opacity: module.locked ? 0.75 : 1,
      }}
    >
      {/* Header row */}
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
            background: hasCurrent ? "rgba(78,91,146,0.12)" : "rgba(78,91,146,0.07)",
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
            {completed}/{total} درس ·{" "}
            {module.locked
              ? "مقفلة"
              : completed === total
              ? "مكتملة"
              : hasCurrent
              ? "جارية"
              : "لم تبدأ"}
          </div>
        </div>

        {module.locked && <Lock size={13} color="#C4C9DE" strokeWidth={2} style={{ flexShrink: 0 }} />}

        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 4,
              background: "rgba(78,91,146,0.1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${total === 0 ? 0 : Math.round((completed / total) * 100)}%`,
                height: "100%",
                background: completed === total ? SUCCESS : PRIMARY,
                borderRadius: 4,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={15} strokeWidth={2} style={{ color: "#9BA3C4" }} />
          </motion.div>
        </div>
      </button>

      {/* Lessons list, then the exam that closes the module */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="lessons"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              {module.lessons.map((lesson, i) => (
                <LessonItem key={lesson.id} lesson={lesson} index={i} onLessonClick={onLessonClick} />
              ))}

              {module.quiz && (
                <>
                  <ExamItem
                    quiz={module.quiz}
                    index={module.lessons.length}
                    isOpen={openExamQuizId === module.quiz.id}
                    onToggle={() => onToggleExam(module.quiz!.id)}
                  />
                  <ExamPanel
                    courseId={courseId}
                    quiz={module.quiz}
                    kind="MODULE"
                    isOpen={openExamQuizId === module.quiz.id}
                    onPassed={onProgressionChanged}
                    onClose={() => onToggleExam(module.quiz!.id)}
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
