import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, ChevronDown, Layers } from "lucide-react";
import { FONT, PRIMARY, SUCCESS } from "../formatters/course-details.formatter";
import type { CurriculumModule, Lesson } from "../types/course-details.types";
import type { QuizView } from "@/features/quiz/student/quiz-player";
import { ExamItem } from "./exam-item";
import { ExamPanel } from "./exam-panel";
import { LessonItem } from "./lesson-item";
import { ModuleGroupCard } from "./module-group-card";

interface CurriculumSectionProps {
  courseId: number;
  lessons: Lesson[];
  modules: CurriculumModule[];
  structure: "FLAT" | "MODULES";
  finalQuiz: QuizView | null;
  onLessonClick?: (id: number) => void;
  onProgressionChanged: () => void;
}

export function CurriculumSection({
  courseId,
  lessons,
  modules,
  structure,
  finalQuiz,
  onLessonClick,
  onProgressionChanged,
}: CurriculumSectionProps) {
  const [showAll, setShowAll] = useState(false);
  // One exam open at a time, module exams and the final exam alike.
  const [openExamQuizId, setOpenExamQuizId] = useState<string | null>(null);

  const displayed = showAll ? lessons : lessons.slice(0, 8);
  const isModules = structure === "MODULES" && modules.length > 0;

  const totalLessons = isModules
    ? modules.reduce((sum, m) => sum + m.lessons.length, 0)
    : lessons.length;
  const completedCount = isModules
    ? modules.reduce((sum, m) => sum + m.lessons.filter((l) => l.status === "completed").length, 0)
    : lessons.filter((l) => l.status === "completed").length;

  const toggleExam = (quizId: string) =>
    setOpenExamQuizId((current) => (current === quizId ? null : quizId));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
      style={{ marginBottom: 20 }}
    >
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "rgba(78,91,146,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PRIMARY,
            }}
          >
            {isModules ? <Layers size={15} strokeWidth={1.8} /> : <BookOpen size={15} strokeWidth={1.8} />}
          </div>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 16, color: "#1F2937" }}>منهج الدورة</div>
            <div style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4" }}>
              {isModules ? `${modules.length} وحدات · ${totalLessons} درس` : `${totalLessons} درس`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {[
            { v: completedCount, label: "مكتمل", c: SUCCESS },
            { v: totalLessons - completedCount, label: "متبقي", c: "#9BA3C4" },
          ].map(({ v, label, c }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: FONT, fontSize: 15, color: c }}>{v}</div>
              <div style={{ fontFamily: FONT, fontSize: 10, color: "#B0B7D4" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {isModules ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {modules.map((mod, i) => (
            <ModuleGroupCard
              key={mod.id}
              courseId={courseId}
              module={mod}
              index={i}
              defaultOpen={mod.lessons.some((l) => l.status === "current")}
              openExamQuizId={openExamQuizId}
              onLessonClick={onLessonClick}
              onToggleExam={toggleExam}
              onProgressionChanged={onProgressionChanged}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Flat lessons list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AnimatePresence>
              {displayed.map((lesson, i) => (
                <LessonItem key={lesson.id} lesson={lesson} index={i} onLessonClick={onLessonClick} />
              ))}
            </AnimatePresence>
          </div>

          {lessons.length > 8 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAll(!showAll)}
              style={{
                width: "100%",
                marginTop: 10,
                padding: "12px",
                borderRadius: 14,
                background: "transparent",
                border: "1.5px solid #ECECEC",
                cursor: "pointer",
                fontFamily: FONT,
                fontSize: 13,
                color: "#9BA3C4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
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
        </>
      )}

      {/* Final exam — the last row of the curriculum, whatever shape the course has */}
      {finalQuiz && (
        <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
          <ExamItem
            quiz={finalQuiz}
            index={0}
            isOpen={openExamQuizId === finalQuiz.id}
            onToggle={() => toggleExam(finalQuiz.id)}
          />
          <ExamPanel
            courseId={courseId}
            quiz={finalQuiz}
            kind="FINAL"
            isOpen={openExamQuizId === finalQuiz.id}
            onPassed={onProgressionChanged}
            onClose={() => toggleExam(finalQuiz.id)}
          />
        </div>
      )}
    </motion.div>
  );
}
