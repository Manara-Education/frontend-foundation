import { motion, AnimatePresence, Reorder } from "motion/react";
import {
  Plus,
  Pencil,
  BookOpen,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import type { Lesson } from "../types/add-lessons.types";
import type { EditCourseFormData, LessonSavePayload } from "../types/add-lessons.types";
import { formatLessonCountLabel } from "../formatters/add-lessons.formatter";
import { EditCourseModal } from "./edit-course-modal";
import { EmptyLessons } from "./empty-lessons";
import { LessonCard } from "./lesson-card";
import { LessonForm } from "./lesson-form";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

interface AddLessonsFormProps {
  lessons: Lesson[];
  showForm: boolean;
  editingId: number | null;
  editingLesson: Lesson | null;
  showCourseEdit: boolean;
  displayTitle: string;
  displayDesc: string;
  displayImage: string;
  displayPrice: number;
  onShowForm: () => void;
  onShowCourseEdit: () => void;
  onCloseCourseEdit: () => void;
  onSave: (data: LessonSavePayload) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onCancelForm: () => void;
  onSaveCourseEdit: (data: EditCourseFormData) => void;
  onReorder: (lessons: Lesson[]) => void;
  onFinish: () => void;
}

export function AddLessonsForm({
  lessons,
  showForm,
  editingId,
  editingLesson,
  showCourseEdit,
  displayTitle,
  displayDesc,
  displayImage,
  displayPrice,
  onShowForm,
  onShowCourseEdit,
  onCloseCourseEdit,
  onSave,
  onDelete,
  onEdit,
  onCancelForm,
  onSaveCourseEdit,
  onReorder,
  onFinish,
}: AddLessonsFormProps) {
  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      <AnimatePresence>
        {showCourseEdit && (
          <EditCourseModal
            title={displayTitle}
            description={displayDesc}
            imageUrl={displayImage}
            price={displayPrice}
            onSave={onSaveCourseEdit}
            onClose={onCloseCourseEdit}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="flex items-center gap-4 rounded-2xl p-4 mb-7"
        style={{
          background: "linear-gradient(135deg, rgba(78,91,146,0.07) 0%, rgba(97,114,172,0.05) 100%)",
          border: "1.5px solid rgba(78,91,146,0.12)",
        }}
      >
        <div className="rounded-2xl flex-shrink-0 overflow-hidden"
          style={{ width: 46, height: 46 }}>
          {displayImage ? (
            <img src={displayImage} alt={displayTitle}
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: "rgba(78,91,146,0.12)", color: PRIMARY }}>
              <BookOpen size={20} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: "#9BA3C4", letterSpacing: 0.5, textTransform: "uppercase" }}>
            الدورة الحالية
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: "#1E2340", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayTitle}
          </div>
          {displayDesc && (
            <div style={{ fontFamily: FONT, fontSize: 11.5, color: "#9BA3C4", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayDesc}
            </div>
          )}
        </div>

        <motion.button
          onClick={onShowCourseEdit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          title="تعديل معلومات الدورة"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 flex-shrink-0"
          style={{
            background: "rgba(78,91,146,0.08)",
            border: "1.5px solid rgba(78,91,146,0.14)",
            color: PRIMARY, cursor: "pointer",
            fontFamily: FONT, fontWeight: 600, fontSize: 12,
          }}
        >
          <Pencil size={13} strokeWidth={2} />
          تعديل
        </motion.button>

        <div
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 flex-shrink-0"
          style={{ background: lessons.length > 0 ? "rgba(39,174,96,0.1)" : "rgba(78,91,146,0.08)" }}
        >
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: lessons.length > 0 ? "#27AE60" : PRIMARY }}>
            {lessons.length}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: lessons.length > 0 ? "#27AE60" : "#9BA3C4" }}>
            {formatLessonCountLabel(lessons.length)}
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.06 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 20, color: "#1E2340", lineHeight: 1.3 }}>
            محتوى الدورة
          </h1>
          <p style={{ fontSize: 13, color: "#717182", marginTop: 3 }}>
            {lessons.length === 0
              ? "أضف دروسك وارتبط كل درس بفيديو على YouTube"
              : `لديك ${lessons.length} ${formatLessonCountLabel(lessons.length)} — يمكنك إعادة الترتيب بالسحب`}
          </p>
        </div>
        {lessons.length > 0 && !showForm && !editingId && (
          <motion.button
            onClick={onShowForm}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="flex items-center gap-2 rounded-2xl px-4 py-2.5 flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 13,
              boxShadow: "0 4px 14px rgba(78,91,146,0.25)",
            }}
          >
            <Plus size={15} />
            إضافة درس
          </motion.button>
        )}
      </motion.div>

      {lessons.length === 0 && !showForm && (
        <EmptyLessons onAdd={onShowForm} />
      )}

      <AnimatePresence>
        {showForm && (
          <LessonForm
            key="add-form"
            lessonNumber={lessons.length + 1}
            onSave={onSave}
            onCancel={onCancelForm}
          />
        )}
      </AnimatePresence>

      {lessons.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Reorder.Group
            axis="y"
            values={lessons}
            onReorder={onReorder}
            style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}
          >
            <AnimatePresence>
              {lessons.map((lesson, idx) => (
                <Reorder.Item
                  key={lesson.id}
                  value={lesson}
                  style={{ listStyle: "none" }}
                >
                  <AnimatePresence>
                    {editingId === lesson.id && editingLesson && (
                      <LessonForm
                        key={`edit-${lesson.id}`}
                        initial={editingLesson}
                        lessonNumber={idx + 1}
                        onSave={onSave}
                        onCancel={onCancelForm}
                      />
                    )}
                  </AnimatePresence>

                  {editingId !== lesson.id && (
                    <LessonCard
                      lesson={lesson}
                      index={idx}
                      onEdit={() => onEdit(lesson.id)}
                      onDelete={() => onDelete(lesson.id)}
                    />
                  )}
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </motion.div>
      )}

      {lessons.length > 0 && !showForm && !editingId && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          onClick={onShowForm}
          whileHover={{ backgroundColor: "rgba(78,91,146,0.06)" }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl mt-3 py-4 transition-colors"
          style={{
            background: "transparent",
            border: "1.5px dashed rgba(78,91,146,0.22)",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 13.5,
            color: PRIMARY,
          }}
        >
          <Plus size={16} />
          إضافة درس جديد
        </motion.button>
      )}

      {lessons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mt-10 flex flex-col gap-4"
        >
          <div style={{ height: 1, background: "rgba(78,91,146,0.08)" }} />

          <div className="flex items-center gap-3 rounded-2xl p-4"
            style={{ background: "rgba(39,174,96,0.06)", border: "1.5px solid rgba(39,174,96,0.15)" }}
          >
            <div className="rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ width: 38, height: 38, background: "rgba(39,174,96,0.12)", color: "#27AE60" }}>
              <CheckCircle size={17} />
            </div>
            <div className="flex-1">
              <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13.5, color: "#1E2340" }}>
                دورتك جاهزة تقريباً!
              </div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: "#5AA87A", marginTop: 2 }}>
                أضفت {lessons.length} {formatLessonCountLabel(lessons.length)} — يمكنك إضافة المزيد في أي وقت
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={onFinish}
              whileHover={{ y: -2, boxShadow: "0 10px 28px rgba(78,91,146,0.32)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 rounded-2xl px-6 py-3"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 4px 16px rgba(78,91,146,0.25)",
              }}
            >
              الانتهاء والعودة للرئيسية
              <ArrowRight size={15} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
