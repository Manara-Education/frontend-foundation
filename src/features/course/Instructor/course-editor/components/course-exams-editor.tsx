import { motion } from "motion/react";
import { Award, Layers } from "lucide-react";
import type {
  CourseLessonEditorState,
  CourseModuleEditorState,
  CourseStructure,
  QuizEditorState,
} from "@/shared/courses";
import { formatModuleOrdinal } from "../formatters/course-editor.formatter";
import { QuizBuilder } from "./quiz-builder";
import { FONT, PRIMARY } from "./editor-theme";

interface CourseExamsEditorProps {
  structure: CourseStructure;
  lessons: CourseLessonEditorState[];
  modules: CourseModuleEditorState[];
  finalQuiz: QuizEditorState | null;
  onLessonQuizChange: (lessonKey: string, quiz: QuizEditorState | null) => void;
  onModuleQuizChange: (moduleKey: string, quiz: QuizEditorState | null) => void;
  onModuleLessonQuizChange: (
    moduleKey: string,
    lessonKey: string,
    quiz: QuizEditorState | null,
  ) => void;
  onFinalQuizChange: (quiz: QuizEditorState | null) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "#717182", letterSpacing: 0.3, marginBottom: 10 }}
    >
      {children}
    </div>
  );
}

function FinalQuizBlock({
  quiz,
  onChange,
}: {
  quiz: QuizEditorState | null;
  onChange: (quiz: QuizEditorState | null) => void;
}) {
  return (
    <div
      style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(78,91,146,0.09)", padding: "20px 22px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "rgba(78,91,146,0.09)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Award size={14} style={{ color: PRIMARY }} />
        </div>
        <div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "#1E2340" }}>الاختبار النهائي</div>
          <div style={{ fontFamily: FONT, fontSize: 11.5, color: "#9BA3C4", marginTop: 1 }}>
            اختياري — اختبار بعد إتمام كل محتوى الدورة
          </div>
        </div>
      </div>
      <QuizBuilder quiz={quiz} onQuizChange={onChange} />
    </div>
  );
}

/**
 * Every exam in the course, in one place: the lesson quizzes, each module's exam, and
 * the course final exam. All three are the same {@link QuizBuilder} — only the owner
 * the saved quiz is written back to changes.
 */
export function CourseExamsEditor({
  structure,
  lessons,
  modules,
  finalQuiz,
  onLessonQuizChange,
  onModuleQuizChange,
  onModuleLessonQuizChange,
  onFinalQuizChange,
}: CourseExamsEditorProps) {
  // ── Flat structure ──────────────────────────────────────────────────────────
  if (structure === "FLAT") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {lessons.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", fontFamily: FONT, fontSize: 14, color: "#9BA3C4" }}>
            أضف دروسًا في تبويب المحتوى أولاً
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <SectionLabel>اختبارات الدروس</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.key}
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    border: "1.5px solid rgba(78,91,146,0.09)",
                    padding: "20px 22px",
                  }}
                >
                  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "#1E2340", marginBottom: 12 }}>
                    {idx + 1}. {lesson.title}
                  </div>
                  <QuizBuilder
                    quiz={lesson.quiz}
                    onQuizChange={(quiz) => onLessonQuizChange(lesson.key, quiz)}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <FinalQuizBlock quiz={finalQuiz} onChange={onFinalQuizChange} />
      </div>
    );
  }

  // ── Module structure ────────────────────────────────────────────────────────
  if (modules.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ textAlign: "center", padding: "32px 0", fontFamily: FONT, fontSize: 14, color: "#9BA3C4" }}>
          أضف وحدات في تبويب المحتوى أولاً
        </div>
        <FinalQuizBlock quiz={finalQuiz} onChange={onFinalQuizChange} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {modules.map((mod, mIdx) => (
        <div
          key={mod.key}
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1.5px solid rgba(78,91,146,0.09)",
            overflow: "hidden",
          }}
        >
          {/* Module header */}
          <div
            style={{
              padding: "14px 22px",
              borderBottom: "1px solid rgba(78,91,146,0.07)",
              background: "rgba(78,91,146,0.02)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "rgba(78,91,146,0.09)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Layers size={14} style={{ color: PRIMARY }} />
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "#1E2340" }}>
              الوحدة {formatModuleOrdinal(mIdx)}: {mod.title}
            </div>
          </div>

          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Module-level exam */}
            <div>
              <SectionLabel>اختبار الوحدة</SectionLabel>
              <QuizBuilder quiz={mod.quiz} onQuizChange={(quiz) => onModuleQuizChange(mod.key, quiz)} />
            </div>

            {/* Per-lesson quizzes */}
            {mod.lessons.length > 0 ? (
              <div style={{ borderTop: "1px solid rgba(78,91,146,0.07)", paddingTop: 18 }}>
                <SectionLabel>اختبارات الدروس</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {mod.lessons.map((lesson, idx) => (
                    <div
                      key={lesson.key}
                      style={{
                        background: "rgba(78,91,146,0.02)",
                        borderRadius: 16,
                        border: "1.5px solid rgba(78,91,146,0.07)",
                        padding: "16px 18px",
                      }}
                    >
                      <div
                        style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: "#1E2340", marginBottom: 10 }}
                      >
                        {idx + 1}. {lesson.title}
                      </div>
                      <QuizBuilder
                        quiz={lesson.quiz}
                        onQuizChange={(quiz) => onModuleLessonQuizChange(mod.key, lesson.key, quiz)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  borderTop: "1px solid rgba(78,91,146,0.07)",
                  paddingTop: 14,
                  fontFamily: FONT,
                  fontSize: 12.5,
                  color: "#9BA3C4",
                }}
              >
                لا توجد دروس في هذه الوحدة — أضف دروسًا في تبويب المحتوى
              </div>
            )}
          </div>
        </div>
      ))}

      <FinalQuizBlock quiz={finalQuiz} onChange={onFinalQuizChange} />
    </div>
  );
}
