import { motion, AnimatePresence, Reorder } from "motion/react";
import { BookOpen, Plus } from "lucide-react";
import type { CourseLessonEditorState } from "@/shared/courses";
import { formatLessonCountLabel } from "../formatters/course-editor.formatter";
import type { LessonDraft, CourseEditorSurface } from "../types/course-editor.types";
import { EmptyLessons } from "./empty-lessons";
import { LessonCard } from "./lesson-card";
import { LessonForm } from "./lesson-form";
import { FONT, PRIMARY } from "./editor-theme";

interface FlatCurriculumSectionProps {
  lessons: CourseLessonEditorState[];
  formOpen: boolean;
  editKey: string | null;
  /** `wizard` is the create step, `tabs` the course editor's content tab. */
  variant?: CourseEditorSurface;
  onOpenAdd: () => void;
  onOpenEdit: (key: string) => void;
  onCloseForm: () => void;
  onSaveLesson: (draft: LessonDraft) => void;
  onDeleteLesson: (key: string) => void;
  onReorder: (lessons: CourseLessonEditorState[]) => void;
  onReorderCommit: () => void;
}

/** The `FLAT` content branch: a single draggable list of lessons. */
export function FlatCurriculumSection({
  lessons,
  formOpen,
  editKey,
  variant = "wizard",
  onOpenAdd,
  onOpenEdit,
  onCloseForm,
  onSaveLesson,
  onDeleteLesson,
  onReorder,
  onReorderCommit,
}: FlatCurriculumSectionProps) {
  const isTabs = variant === "tabs";
  const editingLesson = editKey ? lessons.find((l) => l.key === editKey) : undefined;

  return (
    <div>
      {/* Count badge — wizard only */}
      {!isTabs && lessons.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4" }}>
            {lessons.length} {formatLessonCountLabel(lessons.length)}
          </span>
        </div>
      )}

      {/* Empty state */}
      {lessons.length === 0 && !formOpen && isTabs && <EmptyLessons onAdd={onOpenAdd} />}

      {/* Add form (above the list when adding, replaces the card when editing) */}
      <AnimatePresence>
        {formOpen && !editKey && (
          <LessonForm
            key="add"
            lessonNumber={lessons.length + 1}
            onSave={onSaveLesson}
            onCancel={onCloseForm}
          />
        )}
      </AnimatePresence>

      {/* Lessons list */}
      {lessons.length > 0 && (
        <Reorder.Group
          axis="y"
          values={lessons}
          onReorder={onReorder}
          style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}
        >
          <AnimatePresence>
            {lessons.map((lesson, idx) => (
              <Reorder.Item
                key={lesson.key}
                value={lesson}
                style={{ listStyle: "none" }}
                onDragEnd={onReorderCommit}
              >
                <AnimatePresence>
                  {editKey === lesson.key && editingLesson && (
                    <LessonForm
                      key={`edit-${lesson.key}`}
                      initial={editingLesson}
                      lessonNumber={idx + 1}
                      onSave={onSaveLesson}
                      onCancel={onCloseForm}
                    />
                  )}
                </AnimatePresence>
                {editKey !== lesson.key && (
                  <LessonCard
                    lesson={lesson}
                    index={idx}
                    onEdit={() => onOpenEdit(lesson.key)}
                    onDelete={() => onDeleteLesson(lesson.key)}
                  />
                )}
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {/* Empty state — wizard */}
      {!isTabs && lessons.length === 0 && !formOpen && (
        <div
          style={{
            border: "1.5px dashed rgba(78,91,146,0.18)",
            borderRadius: 16,
            padding: "28px",
            textAlign: "center",
            background: "rgba(78,91,146,0.02)",
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="rounded-2xl flex items-center justify-center"
              style={{ width: 48, height: 48, background: "rgba(78,91,146,0.08)", color: PRIMARY }}
            >
              <BookOpen size={20} />
            </div>
            <div style={{ fontFamily: FONT, fontSize: 14, color: "#717182" }}>لم تضف أي درس بعد</div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>ابدأ بإضافة أول درس في دورتك</div>
          </div>
        </div>
      )}

      {/* Add lesson button */}
      {!isTabs && !formOpen && (
        <button
          onClick={onOpenAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
            padding: "10px 18px",
            borderRadius: 14,
            border: "1.5px dashed rgba(78,91,146,0.25)",
            background: "transparent",
            cursor: "pointer",
            fontFamily: FONT,
            fontSize: 13,
            color: PRIMARY,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(78,91,146,0.05)";
            e.currentTarget.style.borderColor = "rgba(78,91,146,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(78,91,146,0.25)";
          }}
        >
          <Plus size={15} /> إضافة درس
        </button>
      )}

      {isTabs && lessons.length > 0 && !formOpen && !editKey && (
        <button
          onClick={onOpenAdd}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "14px 0",
            borderRadius: 16,
            border: "1.5px dashed rgba(78,91,146,0.22)",
            background: "transparent",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 13.5,
            color: PRIMARY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Plus size={15} /> إضافة درس جديد
        </button>
      )}
    </div>
  );
}

/** The tab header's gradient "add lesson" CTA, shown once the list is non-empty. */
export function AddLessonButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        height: 38,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 12,
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
        color: "#fff",
        border: "none",
        cursor: "pointer",
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        gap: 7,
        boxShadow: "0 3px 12px rgba(78,91,146,0.22)",
      }}
    >
      <Plus size={14} /> إضافة درس
    </motion.button>
  );
}
