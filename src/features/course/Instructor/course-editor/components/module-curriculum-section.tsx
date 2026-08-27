import { useState } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "motion/react";
import { ChevronDown, ChevronUp, GripVertical, Layers, Plus, Trash2 } from "lucide-react";
import type { CourseLessonEditorState, CourseModuleEditorState } from "@/shared/courses";
import {
  formatLessonCountLabel,
  formatModuleCountLabel,
  formatModuleOrdinal,
} from "../formatters/course-editor.formatter";
import type { LessonDraft, ModuleDraft, CourseEditorSurface } from "../types/course-editor.types";
import { Field } from "./field";
import { LessonCard } from "./lesson-card";
import { LessonForm } from "./lesson-form";
import { FONT, PRIMARY, inputStyle } from "./editor-theme";

/**
 * The reference draws this list twice — once in the create wizard's content step and
 * once in the course editor's content tab — with the same structure and a handful of
 * different spacing values. The differences live in this table instead of in a second
 * copy of the component.
 */
const TOKENS = {
  wizard: {
    itemMargin: 12,
    cardRadius: 18,
    headerPadding: "14px 16px 14px 12px",
    headerGap: 12,
    gripSize: 16,
    iconBox: 36,
    iconRadius: 12,
    iconSize: 15,
    titleWeight: 400,
    subtitleSize: 11,
    subtitleMargin: 2,
    showQuizBadge: true,
    editHoverBg: "rgba(78,91,146,0.12)",
    deleteOpacity: "0.7",
    deleteSize: 14,
    chevronSize: 15,
    lessonGap: 10,
    emptyLessonPadding: "16px",
    addLessonSize: 12,
    emptySubtitle: "ابدأ بإضافة الوحدة الأولى في دورتك",
    addModuleMarginTop: 4,
  },
  tabs: {
    itemMargin: 10,
    cardRadius: 20,
    headerPadding: "13px 16px 13px 12px",
    headerGap: 10,
    gripSize: 15,
    iconBox: 34,
    iconRadius: 10,
    iconSize: 14,
    titleWeight: 700,
    subtitleSize: 11.5,
    subtitleMargin: 1,
    showQuizBadge: false,
    editHoverBg: "rgba(78,91,146,0.13)",
    deleteOpacity: "0.6",
    deleteSize: 13,
    chevronSize: 14,
    lessonGap: 8,
    emptyLessonPadding: "18px 0",
    addLessonSize: 12.5,
    emptySubtitle: "ابدأ بإضافة أول وحدة لتنظيم محتوى دورتك",
    addModuleMarginTop: 0,
  },
} as const;

const COMPACT_INPUT: React.CSSProperties = {
  width: "100%",
  borderRadius: 11,
  border: "1.5px solid rgba(78,91,146,0.16)",
  background: "#FAFBFD",
  fontFamily: FONT,
  fontSize: 13.5,
  color: "#1E2340",
  outline: "none",
  boxSizing: "border-box" as const,
};

// ── Module form ───────────────────────────────────────────────────────────────

function ModuleInlineForm({
  initialData,
  variant,
  isEdit = false,
  onSave,
  onClose,
}: {
  initialData?: ModuleDraft;
  variant: CourseEditorSurface;
  isEdit?: boolean;
  onSave: (draft: ModuleDraft) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [titleErr, setTitleErr] = useState("");

  function handleSave() {
    if (!title.trim()) {
      setTitleErr("اسم الوحدة مطلوب");
      return;
    }
    onSave({ title: title.trim(), description: description.trim() });
    onClose();
  }

  if (variant === "tabs") {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: isEdit ? 0.2 : 0.22 }}
        style={{ overflow: "hidden", marginBottom: isEdit ? 0 : 10 }}
      >
        <div
          style={
            isEdit
              ? { borderTop: "1px solid rgba(78,91,146,0.07)", padding: "16px 16px" }
              : {
                  background: "#fff",
                  border: "1.5px solid rgba(78,91,146,0.15)",
                  borderRadius: 18,
                  padding: "20px 22px",
                }
          }
        >
          {!isEdit && (
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "#1E2340", marginBottom: 14 }}>
              إضافة وحدة جديدة
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label
                style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "#1E2340", display: "block", marginBottom: 5 }}
              >
                اسم الوحدة *
              </label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleErr("");
                }}
                placeholder={isEdit ? undefined : "مثال: مقدمة في البرمجة"}
                style={{
                  ...COMPACT_INPUT,
                  height: isEdit ? 42 : 44,
                  paddingRight: 12,
                  paddingLeft: 12,
                  border: `1.5px solid ${titleErr ? "#D4183D" : "rgba(78,91,146,0.16)"}`,
                }}
              />
              {titleErr && (
                <p style={{ fontFamily: FONT, fontSize: 11.5, color: "#D4183D", marginTop: 4 }}>{titleErr}</p>
              )}
            </div>
            <div>
              <label
                style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "#1E2340", display: "block", marginBottom: 5 }}
              >
                وصف الوحدة
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder={isEdit ? undefined : "وصف مختصر..."}
                style={{ ...COMPACT_INPUT, padding: "10px 12px", resize: "none" as const }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: isEdit ? 0 : 2 }}>
              <button
                onClick={handleSave}
                style={{
                  height: isEdit ? 36 : 38,
                  paddingLeft: isEdit ? 18 : 20,
                  paddingRight: isEdit ? 18 : 20,
                  borderRadius: isEdit ? 10 : 11,
                  background: PRIMARY,
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: isEdit ? 12.5 : 13,
                }}
              >
                {isEdit ? "حفظ" : "إضافة الوحدة"}
              </button>
              <button
                onClick={onClose}
                style={{
                  height: isEdit ? 36 : 38,
                  paddingLeft: isEdit ? 14 : 16,
                  paddingRight: isEdit ? 14 : 16,
                  borderRadius: isEdit ? 10 : 11,
                  background: "rgba(78,91,146,0.07)",
                  color: "#717182",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontSize: isEdit ? 12.5 : 13,
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      style={{ overflow: "hidden" }}
    >
      <div
        style={{
          border: "1.5px solid rgba(78,91,146,0.18)",
          borderRadius: 18,
          padding: "22px 22px 20px",
          marginTop: 12,
          background: "rgba(78,91,146,0.02)",
        }}
      >
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "#1E2340", marginBottom: 16 }}>
          {isEdit ? "تعديل الوحدة" : "إضافة وحدة"}
        </div>
        <div className="flex flex-col gap-4">
          <Field label="اسم الوحدة" required error={titleErr}>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleErr("");
              }}
              placeholder="مثال: مقدمة في البرمجة"
              style={inputStyle(!!title, !!titleErr)}
            />
          </Field>
          <Field label="وصف الوحدة">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر..."
              rows={2}
              style={{ ...inputStyle(!!description), height: "auto", padding: "12px 14px", resize: "none", lineHeight: 1.6 }}
            />
          </Field>
        </div>
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleSave}
            style={{
              height: 40,
              paddingLeft: 22,
              paddingRight: 22,
              borderRadius: 12,
              background: PRIMARY,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {isEdit ? "حفظ التعديلات" : "إضافة الوحدة"}
          </button>
          <button
            onClick={onClose}
            style={{
              height: 40,
              paddingLeft: 18,
              paddingRight: 18,
              borderRadius: 12,
              background: "transparent",
              color: "#717182",
              border: "1.5px solid rgba(78,91,146,0.18)",
              cursor: "pointer",
              fontFamily: FONT,
              fontSize: 13,
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Module card ───────────────────────────────────────────────────────────────

interface ModuleCardProps {
  module: CourseModuleEditorState;
  index: number;
  variant: CourseEditorSurface;
  expanded: boolean;
  onToggleExpanded: () => void;
  onEditModule: (draft: ModuleDraft) => void;
  onDeleteModule: () => void;
  /** Fires once, when the module has been dropped in its new place. */
  onReorderCommit: () => void;
  onSaveLesson: (lessonKey: string | null, draft: LessonDraft) => void;
  onDeleteLesson: (lessonKey: string) => void;
  onReorderLessons: (lessons: CourseLessonEditorState[]) => void;
  onReorderLessonsCommit: () => void;
}

function ModuleCard({
  module,
  index,
  variant,
  expanded,
  onToggleExpanded,
  onEditModule,
  onDeleteModule,
  onReorderCommit,
  onSaveLesson,
  onDeleteLesson,
  onReorderLessons,
  onReorderLessonsCommit,
}: ModuleCardProps) {
  const t = TOKENS[variant];
  const dragControls = useDragControls();
  const [lessonFormOpen, setLessonFormOpen] = useState(false);
  const [lessonEditKey, setLessonEditKey] = useState<string | null>(null);
  const [editModuleOpen, setEditModuleOpen] = useState(false);

  function closeLessonForm() {
    setLessonFormOpen(false);
    setLessonEditKey(null);
  }

  function handleSaveLesson(draft: LessonDraft) {
    onSaveLesson(lessonEditKey, draft);
    closeLessonForm();
  }

  const editingLesson = lessonEditKey ? module.lessons.find((l) => l.key === lessonEditKey) : undefined;

  const body = (
    <>
      {/* Module header */}
      <div style={{ display: "flex", alignItems: "center", gap: t.headerGap, padding: t.headerPadding }}>
        <div
          onPointerDown={(e) => dragControls.start(e)}
          style={{ cursor: "grab", color: "#C4C9DE", flexShrink: 0, display: "flex", touchAction: "none" }}
        >
          <GripVertical size={t.gripSize} />
        </div>

        <div
          style={{
            width: t.iconBox,
            height: t.iconBox,
            borderRadius: t.iconRadius,
            background: "rgba(78,91,146,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: PRIMARY,
            flexShrink: 0,
          }}
        >
          <Layers size={t.iconSize} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: t.titleWeight,
              fontSize: 14,
              color: "#1E2340",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            الوحدة {formatModuleOrdinal(index)}: {module.title}
          </div>
          <div
            style={{ fontFamily: FONT, fontSize: t.subtitleSize, color: "#9BA3C4", marginTop: t.subtitleMargin }}
          >
            {module.lessons.length} {formatLessonCountLabel(module.lessons.length)}
            {t.showQuizBadge && module.quiz ? " · اختبار" : ""}
          </div>
        </div>

        {/* Edit module */}
        <button
          onClick={() => setEditModuleOpen((v) => !v)}
          style={{
            padding: "5px 10px",
            borderRadius: 10,
            background: "rgba(78,91,146,0.07)",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontSize: 12,
            color: PRIMARY,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = t.editHoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(78,91,146,0.07)")}
        >
          تعديل
        </button>

        {/* Delete */}
        <button
          onClick={onDeleteModule}
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#D4183D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            opacity: t.deleteOpacity,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = t.deleteOpacity)}
        >
          <Trash2 size={t.deleteSize} />
        </button>

        {/* Expand toggle */}
        <button
          onClick={onToggleExpanded}
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: "rgba(78,91,146,0.06)",
            border: "none",
            cursor: "pointer",
            color: PRIMARY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {expanded ? <ChevronUp size={t.chevronSize} /> : <ChevronDown size={t.chevronSize} />}
        </button>
      </div>

      {/* Inline module edit form */}
      <AnimatePresence>
        {editModuleOpen &&
          (variant === "wizard" ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: "hidden", borderTop: "1px solid rgba(78,91,146,0.08)", padding: "0 16px" }}
            >
              <ModuleInlineForm
                initialData={{ title: module.title, description: module.description }}
                variant={variant}
                isEdit
                onSave={onEditModule}
                onClose={() => setEditModuleOpen(false)}
              />
            </motion.div>
          ) : (
            <ModuleInlineForm
              initialData={{ title: module.title, description: module.description }}
              variant={variant}
              isEdit
              onSave={onEditModule}
              onClose={() => setEditModuleOpen(false)}
            />
          ))}
      </AnimatePresence>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: variant === "wizard" ? 0.22 : 0.2 }}
            style={{ overflow: "hidden", borderTop: "1px solid rgba(78,91,146,0.07)", padding: "16px 16px 18px" }}
          >
            {/* New-lesson form */}
            <AnimatePresence>
              {lessonFormOpen && !lessonEditKey && (
                <LessonForm
                  key="add"
                  lessonNumber={module.lessons.length + 1}
                  onSave={handleSaveLesson}
                  onCancel={closeLessonForm}
                />
              )}
            </AnimatePresence>

            {/* Lessons within module */}
            {module.lessons.length > 0 && (
              <Reorder.Group
                axis="y"
                values={module.lessons}
                onReorder={onReorderLessons}
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: t.lessonGap,
                }}
              >
                <AnimatePresence>
                  {module.lessons.map((lesson, idx) => (
                    <Reorder.Item
                      key={lesson.key}
                      value={lesson}
                      style={{ listStyle: "none" }}
                      onDragEnd={onReorderLessonsCommit}
                    >
                      <AnimatePresence>
                        {lessonEditKey === lesson.key && editingLesson && (
                          <LessonForm
                            key={`edit-${lesson.key}`}
                            initial={editingLesson}
                            lessonNumber={idx + 1}
                            onSave={handleSaveLesson}
                            onCancel={closeLessonForm}
                          />
                        )}
                      </AnimatePresence>
                      {lessonEditKey !== lesson.key && (
                        <LessonCard
                          lesson={lesson}
                          index={idx}
                          onEdit={() => {
                            setLessonEditKey(lesson.key);
                            setLessonFormOpen(true);
                          }}
                          onDelete={() => onDeleteLesson(lesson.key)}
                        />
                      )}
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            )}

            {/* Empty lesson state */}
            {module.lessons.length === 0 && !lessonFormOpen && (
              <div
                style={{
                  textAlign: "center",
                  padding: t.emptyLessonPadding,
                  color: "#9BA3C4",
                  fontFamily: FONT,
                  fontSize: 13,
                }}
              >
                لا توجد دروس في هذه الوحدة بعد
              </div>
            )}

            {/* Add lesson button */}
            {!lessonFormOpen && (
              <button
                onClick={() => {
                  setLessonEditKey(null);
                  setLessonFormOpen(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginTop: variant === "wizard" ? 8 : module.lessons.length > 0 ? 10 : 0,
                  padding: "8px 14px",
                  borderRadius: 12,
                  border: "1.5px dashed rgba(78,91,146,0.22)",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontSize: t.addLessonSize,
                  color: PRIMARY,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(78,91,146,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Plus size={13} /> إضافة درس
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    border: "1.5px solid rgba(78,91,146,0.12)",
    borderRadius: t.cardRadius,
    overflow: "hidden",
  };

  return (
    <Reorder.Item
      value={module}
      dragControls={dragControls}
      dragListener={false}
      // The lesson list below has always had this; the module list did not, which is the
      // whole of why dragging a module looked right and was gone on the next reload.
      // `onReorder` fires continuously while a module is being dragged past its
      // neighbours, so it only moves the local list; the drop is what persists.
      onDragEnd={onReorderCommit}
      style={{ listStyle: "none", marginBottom: t.itemMargin }}
    >
      {variant === "wizard" ? (
        <motion.div layout style={cardStyle}>
          {body}
        </motion.div>
      ) : (
        <div style={cardStyle}>{body}</div>
      )}
    </Reorder.Item>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

interface ModuleCurriculumSectionProps {
  modules: CourseModuleEditorState[];
  variant?: CourseEditorSurface;
  onAddModule: (draft: ModuleDraft) => string;
  onUpdateModule: (key: string, draft: ModuleDraft) => void;
  onDeleteModule: (key: string) => void;
  onReorderModules: (modules: CourseModuleEditorState[]) => void;
  onReorderModulesCommit: () => void;
  onSaveModuleLesson: (moduleKey: string, lessonKey: string | null, draft: LessonDraft) => void;
  onDeleteModuleLesson: (moduleKey: string, lessonKey: string) => void;
  onReorderModuleLessons: (moduleKey: string, lessons: CourseLessonEditorState[]) => void;
  onReorderModuleLessonsCommit: () => void;
}

/** The `MODULES` content branch: draggable modules, each with its own lesson list. */
export function ModuleCurriculumSection({
  modules,
  variant = "wizard",
  onAddModule,
  onUpdateModule,
  onDeleteModule,
  onReorderModules,
  onReorderModulesCommit,
  onSaveModuleLesson,
  onDeleteModuleLesson,
  onReorderModuleLessons,
  onReorderModuleLessonsCommit,
}: ModuleCurriculumSectionProps) {
  const t = TOKENS[variant];
  const [moduleFormOpen, setModuleFormOpen] = useState(false);
  /** Expansion is view state: a module the instructor just added opens, the rest stay shut. */
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  function handleAddModule(draft: ModuleDraft) {
    const key = onAddModule(draft);
    setExpandedKeys((prev) => ({ ...prev, [key]: true }));
  }

  return (
    <div>
      {/* Stats */}
      {modules.length > 0 &&
        (variant === "wizard" ? (
          <div className="flex items-center gap-2 mb-4">
            <span style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4" }}>
              {modules.length} {formatModuleCountLabel(modules.length)} · {totalLessons}{" "}
              {formatLessonCountLabel(totalLessons)}
            </span>
          </div>
        ) : (
          <div style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4", marginBottom: 12 }}>
            {modules.length} {formatModuleCountLabel(modules.length)} · {totalLessons}{" "}
            {formatLessonCountLabel(totalLessons)}
          </div>
        ))}

      {/* Empty state */}
      {modules.length === 0 && !moduleFormOpen && (
        <div
          style={{
            border: "1.5px dashed rgba(78,91,146,0.18)",
            borderRadius: 16,
            padding: "28px",
            textAlign: "center",
            background: "rgba(78,91,146,0.02)",
            marginBottom: 12,
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="rounded-2xl flex items-center justify-center"
              style={{ width: 48, height: 48, background: "rgba(78,91,146,0.08)", color: PRIMARY }}
            >
              <Layers size={20} />
            </div>
            <div style={{ fontFamily: FONT, fontSize: 14, color: "#717182" }}>لم تضف أي وحدة بعد</div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>{t.emptySubtitle}</div>
          </div>
        </div>
      )}

      {/* Modules list */}
      <Reorder.Group
        axis="y"
        values={modules}
        onReorder={onReorderModules}
        style={{ listStyle: "none", padding: 0, margin: 0 }}
      >
        <AnimatePresence>
          {modules.map((module, index) => (
            <ModuleCard
              key={module.key}
              module={module}
              index={index}
              variant={variant}
              expanded={expandedKeys[module.key] ?? false}
              onToggleExpanded={() =>
                setExpandedKeys((prev) => ({ ...prev, [module.key]: !(prev[module.key] ?? false) }))
              }
              onEditModule={(draft) => onUpdateModule(module.key, draft)}
              onDeleteModule={() => onDeleteModule(module.key)}
              onReorderCommit={onReorderModulesCommit}
              onSaveLesson={(lessonKey, draft) => onSaveModuleLesson(module.key, lessonKey, draft)}
              onDeleteLesson={(lessonKey) => onDeleteModuleLesson(module.key, lessonKey)}
              onReorderLessons={(lessons) => onReorderModuleLessons(module.key, lessons)}
              onReorderLessonsCommit={onReorderModuleLessonsCommit}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Inline module form */}
      <AnimatePresence>
        {moduleFormOpen && (
          <ModuleInlineForm variant={variant} onSave={handleAddModule} onClose={() => setModuleFormOpen(false)} />
        )}
      </AnimatePresence>

      {/* Add module button */}
      {!moduleFormOpen && (
        <button
          onClick={() => setModuleFormOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: t.addModuleMarginTop,
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
          <Plus size={15} /> إضافة وحدة
        </button>
      )}
    </div>
  );
}
