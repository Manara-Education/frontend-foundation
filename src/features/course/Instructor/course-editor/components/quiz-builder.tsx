import { useState } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "motion/react";
import {
  HelpCircle,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle,
  ClipboardList,
  Pencil,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  GripVertical,
} from "lucide-react";
import { createEditorKey } from "@/shared/courses";
import type { QuizEditorState, QuizQuestionEditorState } from "@/shared/courses";
import { FONT, PRIMARY } from "./editor-theme";

/**
 * The single quiz/exam builder.
 *
 * A lesson quiz, a module exam and the course final exam are the same domain object
 * with a different owner, so they are the same component here too — the parent decides
 * where the returned `QuizEditorState` is stored and nothing else changes.
 */

function newQuestion(): QuizQuestionEditorState {
  return {
    id: createEditorKey(),
    text: "",
    options: [
      { id: createEditorKey(), text: "" },
      { id: createEditorKey(), text: "" },
    ],
    correctOptionId: "",
    explanation: "",
    hintByAiEnabled: false,
  };
}

function emptyQuiz(): QuizEditorState {
  return { id: null, title: "", instructions: "", passingScore: 70, questions: [] };
}

// ── Validation ─────────────────────────────────────────────────────────────────

interface QuestionErrors {
  text?: string;
  options?: string;
  correctOption?: string;
  emptyOptions?: number[];
}

interface QuizErrors {
  title?: string;
  questions?: string;
  passingScore?: string;
  questionErrors: Record<string, QuestionErrors>;
}

function validateQuiz(quiz: QuizEditorState): QuizErrors {
  const errors: QuizErrors = { questionErrors: {} };
  if (!quiz.title.trim()) errors.title = "أدخل عنوان الاختبار.";
  if (quiz.questions.length === 0) errors.questions = "أضف سؤالًا واحدًا على الأقل.";
  if (quiz.passingScore < 1 || quiz.passingScore > 100 || isNaN(quiz.passingScore))
    errors.passingScore = "يجب أن تكون درجة النجاح بين 1% و100%.";

  quiz.questions.forEach((q) => {
    const qErr: QuestionErrors = {};
    if (!q.text.trim()) qErr.text = "أدخل نص السؤال.";
    if (q.options.length < 2) qErr.options = "أضف خيارين على الأقل.";
    if (!q.correctOptionId) qErr.correctOption = "حدد الإجابة الصحيحة.";
    const emptyOpts = q.options.map((o, i) => (!o.text.trim() ? i : -1)).filter((i) => i >= 0);
    if (emptyOpts.length > 0) qErr.emptyOptions = emptyOpts;
    if (Object.keys(qErr).length > 0) errors.questionErrors[q.id] = qErr;
  });

  return errors;
}

function hasErrors(errors: QuizErrors): boolean {
  return !!(
    errors.title ||
    errors.questions ||
    errors.passingScore ||
    Object.keys(errors.questionErrors).length > 0
  );
}

// ── Delete Confirmation Dialog ─────────────────────────────────────────────────

function DeleteQuizConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "rgba(14,18,42,0.5)", backdropFilter: "blur(6px)", zIndex: 200 }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "32px 28px",
          maxWidth: 400,
          width: "90%",
          boxShadow: "0 24px 80px rgba(14,18,42,0.22)",
          fontFamily: FONT,
        }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="rounded-full flex items-center justify-center"
            style={{ width: 60, height: 60, background: "rgba(212,24,61,0.1)", color: "#D4183D" }}
          >
            <AlertTriangle size={28} strokeWidth={1.8} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E2340", margin: 0, fontFamily: FONT }}>
              حذف الاختبار؟
            </h3>
            <p style={{ fontSize: 13, color: "#717182", marginTop: 8, lineHeight: 1.75, fontFamily: FONT }}>
              سيتم حذف جميع أسئلة الاختبار وإجاباته. لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                background: "rgba(78,91,146,0.07)",
                color: "#717182",
                border: "1.5px solid rgba(78,91,146,0.15)",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                background: "#D4183D",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 4px 14px rgba(212,24,61,0.25)",
              }}
            >
              حذف الاختبار
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Question Card ──────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  index,
  errors,
  onChange,
  onDelete,
}: {
  question: QuizQuestionEditorState;
  index: number;
  errors?: QuestionErrors;
  onChange: (q: QuizQuestionEditorState) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const dragControls = useDragControls();
  const hasErr = errors && Object.keys(errors).length > 0;

  const inputBase: React.CSSProperties = {
    width: "100%",
    borderRadius: 11,
    border: "1.5px solid rgba(78,91,146,0.16)",
    background: "#FAFBFD",
    fontFamily: FONT,
    fontSize: 13.5,
    color: "#1E2340",
    outline: "none",
    padding: "10px 14px",
    transition: "border-color 0.18s, box-shadow 0.18s",
    boxSizing: "border-box",
  };

  return (
    <Reorder.Item
      value={question}
      dragControls={dragControls}
      dragListener={false}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `1.5px solid ${hasErr ? "rgba(212,24,61,0.22)" : "rgba(78,91,146,0.1)"}`,
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(78,91,146,0.05)",
        listStyle: "none",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 cursor-pointer"
        style={{ padding: "14px 18px", borderBottom: expanded ? "1px solid rgba(78,91,146,0.07)" : "none" }}
        onClick={() => setExpanded((e) => !e)}
      >
        <div
          className="rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            width: 30,
            height: 30,
            background: "rgba(78,91,146,0.09)",
            color: PRIMARY,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 13.5,
              color: "#1E2340",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {question.text || "سؤال جديد"}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4", marginTop: 2 }}>
            {question.options.length} خيارات ·{" "}
            {question.correctOptionId ? "✓ تم تحديد الإجابة" : "لم تحدد الإجابة الصحيحة"}
          </div>
        </div>
        {hasErr && <AlertCircle size={15} color="#D4183D" />}
        {/* Drag handle */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ cursor: "grab", touchAction: "none", padding: "0 2px" }}
          onPointerDown={(e) => {
            e.stopPropagation();
            dragControls.start(e);
          }}
        >
          <GripVertical
            size={16}
            strokeWidth={1.8}
            style={{ color: "#C4C9DC", transition: "color 0.15s" }}
            onMouseEnter={(e) => {
              (e.currentTarget as SVGElement).style.color = "#9BA3C4";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as SVGElement).style.color = "#C4C9DC";
            }}
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-xl flex items-center justify-center transition-all flex-shrink-0"
          style={{ width: 30, height: 30, background: "transparent", border: "none", cursor: "pointer", color: "#C4C9DC" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(212,24,61,0.08)";
            e.currentTarget.style.color = "#D4183D";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#C4C9DC";
          }}
        >
          <Trash2 size={14} />
        </button>
        <div style={{ color: "#C4C9DC", flexShrink: 0 }}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div className="flex flex-col gap-5 p-5" dir="rtl">
              {/* Question text */}
              <div className="flex flex-col gap-1.5">
                <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "#1E2340" }}>
                  نص السؤال <span style={{ color: "#D4183D" }}>*</span>
                </label>
                <textarea
                  value={question.text}
                  onChange={(e) => onChange({ ...question, text: e.target.value })}
                  placeholder="اكتب نص السؤال هنا..."
                  rows={2}
                  style={{
                    ...inputBase,
                    resize: "vertical",
                    minHeight: 72,
                    lineHeight: 1.7,
                    border: `1.5px solid ${errors?.text ? "#D4183D" : "rgba(78,91,146,0.16)"}`,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = PRIMARY;
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors?.text ? "#D4183D" : "rgba(78,91,146,0.16)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {errors?.text && (
                  <p style={{ fontFamily: FONT, fontSize: 11.5, color: "#D4183D" }}>{errors.text}</p>
                )}
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "#1E2340" }}>
                    خيارات الإجابة <span style={{ color: "#D4183D" }}>*</span>
                  </label>
                  <span style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4" }}>
                    انقر الدائرة لتحديد الإجابة الصحيحة
                  </span>
                </div>

                {errors?.options && (
                  <p style={{ fontFamily: FONT, fontSize: 11.5, color: "#D4183D" }}>{errors.options}</p>
                )}
                {errors?.correctOption && (
                  <p style={{ fontFamily: FONT, fontSize: 11.5, color: "#D4183D" }}>{errors.correctOption}</p>
                )}

                <div className="flex flex-col gap-2">
                  {question.options.map((opt, oi) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      {/* Correct radio */}
                      <button
                        onClick={() => onChange({ ...question, correctOptionId: opt.id })}
                        title="تعيين كإجابة صحيحة"
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 99,
                          flexShrink: 0,
                          border: `2px solid ${question.correctOptionId === opt.id ? "#27AE60" : "rgba(78,91,146,0.25)"}`,
                          background: question.correctOptionId === opt.id ? "#27AE60" : "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                        }}
                      >
                        {question.correctOptionId === opt.id && <Check size={12} color="#fff" strokeWidth={3} />}
                      </button>

                      {/* Option text */}
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) =>
                          onChange({
                            ...question,
                            options: question.options.map((o) =>
                              o.id === opt.id ? { ...o, text: e.target.value } : o,
                            ),
                          })
                        }
                        placeholder={`الخيار ${oi + 1}`}
                        style={{
                          ...inputBase,
                          flex: 1,
                          height: 42,
                          border: `1.5px solid ${errors?.emptyOptions?.includes(oi) ? "#D4183D" : "rgba(78,91,146,0.16)"}`,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = PRIMARY;
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.07)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = errors?.emptyOptions?.includes(oi)
                            ? "#D4183D"
                            : "rgba(78,91,146,0.16)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />

                      {/* Remove option */}
                      {question.options.length > 2 && (
                        <button
                          onClick={() => {
                            const newOptions = question.options.filter((o) => o.id !== opt.id);
                            onChange({
                              ...question,
                              options: newOptions,
                              correctOptionId:
                                question.correctOptionId === opt.id ? "" : question.correctOptionId,
                            });
                          }}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 9,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#C4C9DC",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(212,24,61,0.08)";
                            e.currentTarget.style.color = "#D4183D";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#C4C9DC";
                          }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add option */}
                {question.options.length < 5 && (
                  <button
                    onClick={() =>
                      onChange({
                        ...question,
                        options: [...question.options, { id: createEditorKey(), text: "" }],
                      })
                    }
                    style={{
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(78,91,146,0.04)",
                      border: "1.5px dashed rgba(78,91,146,0.2)",
                      cursor: "pointer",
                      fontFamily: FONT,
                      fontSize: 12.5,
                      color: "#9BA3C4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(78,91,146,0.08)";
                      e.currentTarget.style.borderColor = "rgba(78,91,146,0.3)";
                      e.currentTarget.style.color = PRIMARY;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(78,91,146,0.04)";
                      e.currentTarget.style.borderColor = "rgba(78,91,146,0.2)";
                      e.currentTarget.style.color = "#9BA3C4";
                    }}
                  >
                    <Plus size={13} /> إضافة خيار
                  </button>
                )}
              </div>

              {/* Explanation */}
              <div className="flex flex-col gap-1.5">
                <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "#1E2340" }}>
                  توضيح الإجابة
                  <span style={{ fontSize: 11, color: "#B0B7D4", fontWeight: 400, marginRight: 4 }}>
                    (اختياري)
                  </span>
                </label>
                <textarea
                  value={question.explanation}
                  onChange={(e) => onChange({ ...question, explanation: e.target.value })}
                  placeholder="شرح مختصر يوضح الإجابة الصحيحة (يُعرض للطالب بعد الاختبار)..."
                  rows={2}
                  style={{ ...inputBase, resize: "vertical", minHeight: 60, lineHeight: 1.7 }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = PRIMARY;
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.07)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Hint by AI toggle */}
              <div
                className="flex items-center justify-between gap-4"
                style={{ borderTop: "1px solid rgba(78,91,146,0.08)", paddingTop: 14 }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "#1E2340", marginBottom: 3 }}
                  >
                    السماح بالتلميح بواسطة الذكاء الاصطناعي
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 11.5, color: "#9BA3C4", lineHeight: 1.6 }}>
                    يسمح للطالب بطلب تلميح بواسطة الذكاء الاصطناعي أثناء الإجابة عن هذا السؤال.
                  </div>
                  {question.hintByAiEnabled && (
                    <div
                      className="flex items-center gap-1.5"
                      style={{ fontFamily: FONT, fontSize: 11.5, color: "#6172AC", marginTop: 5, fontWeight: 500 }}
                    >
                      <Sparkles size={11} strokeWidth={1.8} />
                      التلميح بواسطة الذكاء الاصطناعي مفعّل
                    </div>
                  )}
                </div>
                {/* Toggle switch */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({ ...question, hintByAiEnabled: !question.hintByAiEnabled });
                  }}
                  aria-label="تبديل التلميح بواسطة الذكاء الاصطناعي"
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 99,
                    background: question.hintByAiEnabled ? PRIMARY : "rgba(78,91,146,0.15)",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.22s",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      left: question.hintByAiEnabled ? 23 : 3,
                      width: 18,
                      height: 18,
                      borderRadius: 99,
                      background: "#fff",
                      transition: "left 0.22s",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                    }}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}

// ── Quiz Summary Card ──────────────────────────────────────────────────────────

function QuizSummaryCard({
  quiz,
  onEdit,
  onDelete,
}: {
  quiz: QuizEditorState;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      dir="rtl"
      style={{
        background: "linear-gradient(135deg, rgba(78,91,146,0.04) 0%, rgba(78,91,146,0.06) 100%)",
        borderRadius: 18,
        border: "1.5px solid rgba(78,91,146,0.15)",
        padding: "18px 20px",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ width: 42, height: 42, background: "rgba(78,91,146,0.12)", color: PRIMARY }}
          >
            <ClipboardList size={18} strokeWidth={1.8} />
          </div>
          <div>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: "#1E2340" }}>
              {quiz.title}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span style={{ fontFamily: FONT, fontSize: 12, color: "#717182" }}>
                {quiz.questions.length} أسئلة
              </span>
              <span
                style={{ width: 3, height: 3, borderRadius: 99, background: "#C4C9DC", flexShrink: 0 }}
              />
              <span style={{ fontFamily: FONT, fontSize: 12, color: "#717182" }}>
                درجة النجاح: {quiz.passingScore}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            style={{
              height: 34,
              paddingLeft: 14,
              paddingRight: 14,
              borderRadius: 10,
              background: "rgba(78,91,146,0.09)",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontSize: 12.5,
              color: PRIMARY,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(78,91,146,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(78,91,146,0.09)";
            }}
          >
            <Pencil size={13} /> تعديل
          </button>
          <button
            onClick={onDelete}
            style={{
              height: 34,
              paddingLeft: 14,
              paddingRight: 14,
              borderRadius: 10,
              background: "rgba(212,24,61,0.07)",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontSize: 12.5,
              color: "#D4183D",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(212,24,61,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(212,24,61,0.07)";
            }}
          >
            <Trash2 size={13} /> حذف
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── QuizBuilder ────────────────────────────────────────────────────────────────

export function QuizBuilder({
  quiz: initialQuiz,
  onQuizChange,
}: {
  quiz?: QuizEditorState | null;
  onQuizChange: (quiz: QuizEditorState | null) => void;
}) {
  const [phase, setPhase] = useState<"empty" | "building" | "saved">(initialQuiz ? "saved" : "empty");
  const [savedQuiz, setSavedQuiz] = useState<QuizEditorState | null>(initialQuiz ?? null);
  const [draftQuiz, setDraftQuiz] = useState<QuizEditorState>(initialQuiz ?? emptyQuiz());
  const [errors, setErrors] = useState<QuizErrors>({ questionErrors: {} });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const inputBase: React.CSSProperties = {
    width: "100%",
    borderRadius: 13,
    border: "1.5px solid rgba(78,91,146,0.16)",
    background: "#FAFBFD",
    fontFamily: FONT,
    fontSize: 14,
    color: "#1E2340",
    outline: "none",
    transition: "border-color 0.18s, box-shadow 0.18s",
    boxSizing: "border-box",
  };

  const handleSaveQuiz = () => {
    const errs = validateQuiz(draftQuiz);
    if (hasErrors(errs)) {
      setErrors(errs);
      return;
    }
    setErrors({ questionErrors: {} });
    setSavedQuiz(draftQuiz);
    setPhase("saved");
    onQuizChange(draftQuiz);
  };

  const handleCancelBuilding = () => {
    if (savedQuiz) {
      setDraftQuiz(savedQuiz);
      setPhase("saved");
    } else {
      setPhase("empty");
    }
    setErrors({ questionErrors: {} });
  };

  const handleDeleteQuiz = () => {
    setShowDeleteConfirm(false);
    setSavedQuiz(null);
    setDraftQuiz(emptyQuiz());
    setPhase("empty");
    onQuizChange(null);
  };

  const handleStartEdit = () => {
    if (savedQuiz) setDraftQuiz(savedQuiz);
    setErrors({ questionErrors: {} });
    setPhase("building");
  };

  return (
    <>
      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteQuizConfirm
            onConfirm={handleDeleteQuiz}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Section header */}
      <div className="flex items-center gap-2 mb-4" dir="rtl">
        <div
          className="rounded-xl flex items-center justify-center"
          style={{ width: 28, height: 28, background: "rgba(78,91,146,0.09)", color: PRIMARY }}
        >
          <HelpCircle size={14} strokeWidth={1.8} />
        </div>
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "#1E2340" }}>
          اختبار الدرس
        </span>
        <span style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4", marginRight: 2 }}>
          (اختياري)
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Empty state ── */}
        {phase === "empty" && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col items-center gap-4 py-8 rounded-2xl"
            dir="rtl"
            style={{ background: "rgba(78,91,146,0.025)", border: "1.5px dashed rgba(78,91,146,0.2)" }}
          >
            <div
              className="rounded-2xl flex items-center justify-center"
              style={{ width: 52, height: 52, background: "rgba(78,91,146,0.09)", color: PRIMARY }}
            >
              <ClipboardList size={24} strokeWidth={1.6} />
            </div>
            <div className="text-center px-4">
              <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14.5, color: "#1E2340" }}>
                اختبار الدرس
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 12.5,
                  color: "#9BA3C4",
                  marginTop: 5,
                  lineHeight: 1.65,
                  maxWidth: 300,
                }}
              >
                أضف اختبارًا قصيرًا للتأكد من استيعاب الطلاب لمحتوى الدرس.
              </div>
            </div>
            <button
              onClick={() => setPhase("building")}
              style={{
                height: 42,
                paddingLeft: 24,
                paddingRight: 24,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 13.5,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 14px rgba(78,91,146,0.24)",
              }}
            >
              <Plus size={14} /> إضافة اختبار
            </button>
          </motion.div>
        )}

        {/* ── Saved state ── */}
        {phase === "saved" && savedQuiz && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <QuizSummaryCard
              quiz={savedQuiz}
              onEdit={handleStartEdit}
              onDelete={() => setShowDeleteConfirm(true)}
            />
          </motion.div>
        )}

        {/* ── Building state ── */}
        {phase === "building" && (
          <motion.div
            key="building"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-5"
            dir="rtl"
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid rgba(78,91,146,0.12)",
              padding: "24px",
              boxShadow: "0 4px 20px rgba(78,91,146,0.07)",
            }}
          >
            {/* Quiz Title */}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340" }}>
                عنوان الاختبار <span style={{ color: "#D4183D" }}>*</span>
              </label>
              <input
                type="text"
                value={draftQuiz.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setDraftQuiz((q) => ({ ...q, title }));
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="مثال: اختبار الدرس الأول"
                style={{
                  ...inputBase,
                  height: 48,
                  paddingRight: 14,
                  paddingLeft: 14,
                  border: `1.5px solid ${errors.title ? "#D4183D" : draftQuiz.title ? PRIMARY : "rgba(78,91,146,0.16)"}`,
                  boxShadow: errors.title
                    ? "0 0 0 3px rgba(212,24,61,0.07)"
                    : draftQuiz.title
                      ? "0 0 0 3px rgba(78,91,146,0.08)"
                      : "none",
                }}
                onFocus={(e) => {
                  if (!errors.title) {
                    e.currentTarget.style.borderColor = PRIMARY;
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.08)";
                  }
                }}
                onBlur={(e) => {
                  if (!errors.title && !draftQuiz.title) {
                    e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              />
              {errors.title && (
                <p style={{ fontFamily: FONT, fontSize: 12, color: "#D4183D" }}>{errors.title}</p>
              )}
            </div>

            {/* Instructions */}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340" }}>
                تعليمات الاختبار
                <span style={{ fontSize: 11, color: "#B0B7D4", fontWeight: 400, marginRight: 4 }}>
                  (اختياري)
                </span>
              </label>
              <textarea
                value={draftQuiz.instructions}
                onChange={(e) => {
                  const instructions = e.target.value;
                  setDraftQuiz((q) => ({ ...q, instructions }));
                }}
                placeholder="تعليمات أو ملاحظات للطلاب قبل بدء الاختبار..."
                rows={2}
                style={{ ...inputBase, padding: "11px 14px", resize: "vertical", minHeight: 68, lineHeight: 1.75 }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = PRIMARY;
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.07)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Passing score */}
            <div className="flex items-end gap-5">
              <div className="flex flex-col gap-1.5" style={{ maxWidth: 180 }}>
                <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340" }}>
                  درجة النجاح (%) <span style={{ color: "#D4183D" }}>*</span>
                </label>
                <input
                  type="number"
                  value={draftQuiz.passingScore}
                  min={1}
                  max={100}
                  onChange={(e) => {
                    const passingScore = Number(e.target.value);
                    setDraftQuiz((q) => ({ ...q, passingScore }));
                    setErrors((prev) => ({ ...prev, passingScore: undefined }));
                  }}
                  style={{
                    ...inputBase,
                    height: 48,
                    paddingRight: 14,
                    paddingLeft: 14,
                    border: `1.5px solid ${errors.passingScore ? "#D4183D" : "rgba(78,91,146,0.16)"}`,
                    boxShadow: errors.passingScore ? "0 0 0 3px rgba(212,24,61,0.07)" : "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = PRIMARY;
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.passingScore ? "#D4183D" : "rgba(78,91,146,0.16)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {errors.passingScore && (
                  <p style={{ fontFamily: FONT, fontSize: 12, color: "#D4183D" }}>{errors.passingScore}</p>
                )}
              </div>
              <div className="pb-1.5" style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", lineHeight: 1.6 }}>
                الافتراضي 70% — يجب أن يحصل الطالب على هذه النسبة أو أعلى لاجتياز الاختبار
              </div>
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "#1E2340" }}>
                  الأسئلة
                  <span
                    style={{ fontFamily: FONT, fontSize: 11.5, color: "#9BA3C4", fontWeight: 400, marginRight: 8 }}
                  >
                    ({draftQuiz.questions.length})
                  </span>
                </div>
                {errors.questions && (
                  <p style={{ fontFamily: FONT, fontSize: 12, color: "#D4183D" }}>{errors.questions}</p>
                )}
              </div>

              <Reorder.Group
                axis="y"
                values={draftQuiz.questions}
                onReorder={(questions) => setDraftQuiz((q) => ({ ...q, questions }))}
                className="flex flex-col gap-3"
                style={{ padding: 0, margin: 0 }}
              >
                {draftQuiz.questions.map((q, qi) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    index={qi}
                    errors={errors.questionErrors[q.id]}
                    onChange={(updated) =>
                      setDraftQuiz((quiz) => ({
                        ...quiz,
                        questions: quiz.questions.map((x) => (x.id === q.id ? updated : x)),
                      }))
                    }
                    onDelete={() =>
                      setDraftQuiz((quiz) => ({
                        ...quiz,
                        questions: quiz.questions.filter((x) => x.id !== q.id),
                      }))
                    }
                  />
                ))}
              </Reorder.Group>

              {/* Add question button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDraftQuiz((q) => ({ ...q, questions: [...q.questions, newQuestion()] }))}
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 14,
                  marginTop: 12,
                  background: "rgba(78,91,146,0.04)",
                  border: "1.5px dashed rgba(78,91,146,0.22)",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontSize: 13.5,
                  color: "#717182",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(78,91,146,0.09)";
                  e.currentTarget.style.borderColor = "rgba(78,91,146,0.3)";
                  e.currentTarget.style.color = PRIMARY;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(78,91,146,0.04)";
                  e.currentTarget.style.borderColor = "rgba(78,91,146,0.22)";
                  e.currentTarget.style.color = "#717182";
                }}
              >
                <Plus size={16} /> إضافة سؤال
              </motion.button>
            </div>

            {/* Builder actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSaveQuiz}
                style={{
                  height: 46,
                  paddingLeft: 26,
                  paddingRight: 26,
                  borderRadius: 13,
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  boxShadow: "0 4px 16px rgba(78,91,146,0.25)",
                  transition: "box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 6px 22px rgba(78,91,146,0.32)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(78,91,146,0.25)";
                }}
              >
                <CheckCircle size={16} /> حفظ الاختبار
              </button>
              <button
                onClick={handleCancelBuilding}
                style={{
                  height: 46,
                  paddingLeft: 22,
                  paddingRight: 22,
                  borderRadius: 13,
                  background: "transparent",
                  color: "#717182",
                  border: "1.5px solid rgba(78,91,146,0.16)",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: 14,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(78,91,146,0.3)";
                  e.currentTarget.style.color = PRIMARY;
                  e.currentTarget.style.background = "rgba(78,91,146,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)";
                  e.currentTarget.style.color = "#717182";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
