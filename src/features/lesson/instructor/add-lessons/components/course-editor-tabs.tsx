import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlignLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  CreditCard,
  FileText,
  ImageIcon,
  Save,
  X,
  XCircle,
} from "lucide-react";
import { ErrorOverlay } from "@/shared/components/ErrorOverlay/ErrorOverlay";
import { AccessTypeRow } from "@/features/course/Instructor/course-editor/components/access-type-section";
import { CourseExamsEditor } from "@/features/course/Instructor/course-editor/components/course-exams-editor";
import {
  AddLessonButton,
  FlatCurriculumSection,
} from "@/features/course/Instructor/course-editor/components/flat-curriculum-section";
import { ModuleCurriculumSection } from "@/features/course/Instructor/course-editor/components/module-curriculum-section";
import { ModalSection } from "@/features/course/Instructor/course-editor/components/section-card";
import { StructureRadioRow } from "@/features/course/Instructor/course-editor/components/structure-section";
import { SubscriptionPlansSection } from "@/features/course/Instructor/course-editor/components/subscription-plans-section";
import {
  FONT,
  PRIMARY,
  TAB_INPUT_BASE,
} from "@/features/course/Instructor/course-editor/components/editor-theme";
import type { CourseTab, useAddLessons } from "../hooks/use-add-lessons";

type CourseEditorController = ReturnType<typeof useAddLessons>;

const TABS: { id: CourseTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "نظرة عامة", icon: BookOpen },
  { id: "content", label: "المحتوى", icon: AlignLeft },
  { id: "quizzes", label: "الاختبارات", icon: FileText },
  { id: "pricing", label: "السعر والوصول", icon: CreditCard },
];

interface CourseEditorTabsProps extends CourseEditorController {
  onFinish: () => void;
}

/**
 * The instructor course editor: one course, four tabs, one aggregate behind them.
 *
 * Content, exams and pricing are the same shared components the create wizard uses —
 * only the chrome around them is this screen's own.
 */
export function CourseEditorTabs({
  editor,
  activeTab,
  setActiveTab,
  lessonFormOpen,
  lessonEditKey,
  publishError,
  pricingError,
  infoSaved,
  setInfoSaved,
  openAddLesson,
  openEditLesson,
  closeLessonForm,
  saveLesson,
  saveModuleLesson,
  deleteLesson,
  saveOverview,
  savePricing,
  setAccessType,
  setPurchasePrice,
  publish,
  unpublish,
  onFinish,
}: CourseEditorTabsProps) {
  const { state, totalLessons, imagePreview, purchasePriceInput } = editor;
  const [imgDragging, setImgDragging] = useState(false);
  const imgFileRef = useRef<HTMLInputElement>(null);

  const coverImage = imagePreview ?? state.image;
  const isPublished = state.status === "PUBLISHED";

  function pickImage(file: File | undefined | null) {
    if (!file || !file.type.startsWith("image/")) return;
    editor.setImage(file, URL.createObjectURL(file));
  }

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      {/* ── COURSE HEADER ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        style={{
          background: "#fff",
          borderRadius: 22,
          border: "1.5px solid rgba(78,91,146,0.1)",
          overflow: "hidden",
          marginBottom: 20,
          boxShadow: "0 4px 24px rgba(78,91,146,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
          {/* Cover thumbnail */}
          <div style={{ width: 90, minHeight: 80, flexShrink: 0, position: "relative", overflow: "hidden" }}>
            {coverImage ? (
              <img
                src={coverImage}
                alt={state.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg, rgba(78,91,146,0.12) 0%, rgba(97,114,172,0.08) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "absolute",
                  inset: 0,
                }}
              >
                <BookOpen size={24} style={{ color: "rgba(78,91,146,0.35)" }} />
              </div>
            )}
          </div>

          {/* Info */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#1E2340",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {state.title}
              </div>
              {/* Status badge */}
              <div
                style={{
                  flexShrink: 0,
                  padding: "2px 10px",
                  borderRadius: 99,
                  background: isPublished ? "rgba(34,197,94,0.1)" : "rgba(234,156,26,0.1)",
                  border: `1px solid ${isPublished ? "rgba(34,197,94,0.25)" : "rgba(234,156,26,0.3)"}`,
                  fontFamily: FONT,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: isPublished ? "#15803D" : "#A16207",
                }}
              >
                {isPublished ? "منشورة" : "مسودة"}
              </div>
            </div>
            <div style={{ fontFamily: FONT, fontSize: 11.5, color: "#9BA3C4" }}>
              {totalLessons} درس
              {state.description &&
                ` · ${state.description.slice(0, 60)}${state.description.length > 60 ? "..." : ""}`}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px", flexShrink: 0 }}>
            {publishError && (
              <div style={{ fontFamily: FONT, fontSize: 11.5, color: "#D4183D", maxWidth: 180, lineHeight: 1.4 }}>
                {publishError}
              </div>
            )}
            {!isPublished ? (
              <motion.button
                onClick={publish}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  height: 38,
                  paddingLeft: 18,
                  paddingRight: 18,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 12.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 3px 12px rgba(78,91,146,0.28)",
                  whiteSpace: "nowrap",
                }}
              >
                <CheckCircle size={13} /> نشر الدورة
              </motion.button>
            ) : (
              <motion.button
                onClick={unpublish}
                whileHover={{ y: -1 }}
                style={{
                  height: 38,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderRadius: 12,
                  background: "transparent",
                  color: "#9BA3C4",
                  border: "1.5px solid rgba(78,91,146,0.18)",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                }}
              >
                <XCircle size={13} /> إلغاء النشر
              </motion.button>
            )}
            <button
              onClick={onFinish}
              style={{
                height: 38,
                paddingLeft: 14,
                paddingRight: 14,
                borderRadius: 12,
                background: "rgba(78,91,146,0.06)",
                color: PRIMARY,
                border: "1px solid rgba(78,91,146,0.14)",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
                whiteSpace: "nowrap",
              }}
            >
              <ArrowRight size={13} /> العودة
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── TABS ──────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 2 }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                height: 40,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: 12,
                border: "none",
                background: isActive ? PRIMARY : "rgba(78,91,146,0.06)",
                color: isActive ? "#fff" : "#9BA3C4",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                transition: "all 0.18s",
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxShadow: isActive ? "0 3px 12px rgba(78,91,146,0.28)" : "none",
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* ── TAB 1: نظرة عامة ─────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                border: "1.5px solid rgba(78,91,146,0.09)",
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#1E2340",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
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
                  }}
                >
                  <BookOpen size={14} style={{ color: PRIMARY }} />
                </div>
                معلومات الدورة
              </div>

              {/* Title */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "#1E2340" }}>
                  عنوان الدورة <span style={{ color: "#D4183D" }}>*</span>
                </label>
                <input
                  type="text"
                  value={state.title}
                  onChange={(e) => editor.setTitle(e.target.value)}
                  placeholder="أدخل عنوان الدورة..."
                  style={{ ...TAB_INPUT_BASE, height: 46, paddingRight: 13, paddingLeft: 13 }}
                />
              </div>

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "#1E2340" }}>
                  وصف الدورة
                </label>
                <textarea
                  value={state.description}
                  onChange={(e) => editor.setDescription(e.target.value)}
                  placeholder="أضف وصفًا مختصرًا للدورة..."
                  rows={3}
                  style={{
                    ...TAB_INPUT_BASE,
                    height: "auto",
                    padding: "12px 13px",
                    resize: "vertical" as const,
                    minHeight: 80,
                    lineHeight: 1.75,
                  }}
                />
              </div>

              {/* Image */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "#1E2340" }}>
                  صورة الغلاف
                </label>
                {coverImage ? (
                  <div style={{ borderRadius: 14, overflow: "hidden", height: 160, position: "relative" }}>
                    <img src={coverImage} alt="غلاف" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      onClick={editor.clearImage}
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: "rgba(212,24,61,0.85)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => imgFileRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setImgDragging(true);
                    }}
                    onDragLeave={() => setImgDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setImgDragging(false);
                      pickImage(e.dataTransfer.files[0]);
                    }}
                    style={{
                      height: 120,
                      borderRadius: 14,
                      border: `2px dashed ${imgDragging ? PRIMARY : "rgba(78,91,146,0.2)"}`,
                      background: imgDragging ? "rgba(78,91,146,0.04)" : "#FAFBFD",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <ImageIcon size={20} style={{ color: imgDragging ? PRIMARY : "#C4C9DC" }} />
                    <div
                      style={{
                        fontFamily: FONT,
                        fontSize: 12.5,
                        color: imgDragging ? PRIMARY : "#9BA3C4",
                        fontWeight: 600,
                      }}
                    >
                      {imgDragging ? "أفلت الصورة هنا" : "ارفع صورة الغلاف"}
                    </div>
                    <input
                      ref={imgFileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => pickImage(e.target.files?.[0])}
                    />
                  </div>
                )}
              </div>

              {/* Structure */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "#1E2340" }}>
                  هيكل الدورة
                </label>
                <StructureRadioRow value={state.structure} onChange={editor.setStructure} />
              </div>

              {/* Save button */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <motion.button
                  onClick={saveOverview}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    height: 42,
                    paddingLeft: 22,
                    paddingRight: 22,
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
                    boxShadow: "0 3px 12px rgba(78,91,146,0.24)",
                  }}
                >
                  <Save size={13} /> حفظ التعديلات
                </motion.button>
                <AnimatePresence>
                  {infoSaved && (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      onAnimationComplete={() => setTimeout(() => setInfoSaved(false), 2000)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontFamily: FONT,
                        fontSize: 12,
                        color: "#27AE60",
                      }}
                    >
                      <CheckCircle size={13} /> تم الحفظ
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 2: المحتوى ────────────────────────────────────────────── */}
        {activeTab === "content" && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: "#1E2340" }}>محتوى الدورة</div>
                <div style={{ fontFamily: FONT, fontSize: 12.5, color: "#9BA3C4", marginTop: 2 }}>
                  {state.structure === "FLAT"
                    ? state.lessons.length === 0
                      ? "أضف دروسك — كل درس مرتبط بفيديو من يوتيوب أو فيميو"
                      : `${state.lessons.length} درس — اسحب لإعادة الترتيب`
                    : state.modules.length === 0
                      ? "أضف وحدات لتنظيم محتوى دورتك"
                      : `${state.modules.length} وحدة — اسحب لإعادة الترتيب`}
                </div>
              </div>
              {state.structure === "FLAT" && state.lessons.length > 0 && !lessonFormOpen && !lessonEditKey && (
                <AddLessonButton onClick={openAddLesson} />
              )}
            </div>

            <AnimatePresence mode="wait">
              {state.structure === "FLAT" ? (
                <motion.div
                  key="flat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <FlatCurriculumSection
                    lessons={state.lessons}
                    formOpen={lessonFormOpen}
                    editKey={lessonEditKey}
                    variant="tabs"
                    onOpenAdd={openAddLesson}
                    onOpenEdit={openEditLesson}
                    onCloseForm={closeLessonForm}
                    onSaveLesson={saveLesson}
                    onDeleteLesson={deleteLesson}
                    onReorder={editor.reorderLessons}
                    onReorderCommit={editor.commitLessonOrder}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="modules"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <ModuleCurriculumSection
                    modules={state.modules}
                    variant="tabs"
                    onAddModule={editor.addModule}
                    onUpdateModule={editor.updateModule}
                    onDeleteModule={editor.deleteModule}
                    onReorderModules={editor.reorderModules}
                    onReorderModulesCommit={editor.commitModuleOrder}
                    onSaveModuleLesson={saveModuleLesson}
                    onDeleteModuleLesson={editor.deleteModuleLesson}
                    onReorderModuleLessons={editor.reorderModuleLessons}
                    onReorderModuleLessonsCommit={editor.commitModuleOrder}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── TAB 3: الاختبارات ─────────────────────────────────────────── */}
        {activeTab === "quizzes" && (
          <motion.div
            key="quizzes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <CourseExamsEditor
              structure={state.structure}
              lessons={state.lessons}
              modules={state.modules}
              finalQuiz={state.finalQuiz}
              onLessonQuizChange={editor.setLessonQuiz}
              onModuleQuizChange={editor.setModuleQuiz}
              onModuleLessonQuizChange={editor.setModuleLessonQuiz}
              onFinalQuizChange={editor.setFinalQuiz}
            />
          </motion.div>
        )}

        {/* ── TAB 4: السعر والوصول ─────────────────────────────────────── */}
        {activeTab === "pricing" && (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Access type selector */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: "1.5px solid rgba(78,91,146,0.09)",
                  padding: "22px 26px",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 14.5,
                    color: "#1E2340",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
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
                    }}
                  >
                    <CheckCircle size={14} style={{ color: PRIMARY }} />
                  </div>
                  نوع الوصول
                </div>
                <AccessTypeRow value={state.accessType} onChange={setAccessType} />
              </div>

              {/* Purchase price */}
              <AnimatePresence>
                {state.accessType === "PURCHASE" && (
                  <motion.div
                    key="pp"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 20,
                        border: "1.5px solid rgba(78,91,146,0.09)",
                        padding: "22px 26px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: FONT,
                          fontWeight: 700,
                          fontSize: 14.5,
                          color: "#1E2340",
                          marginBottom: 14,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
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
                          }}
                        >
                          <CreditCard size={14} style={{ color: PRIMARY }} />
                        </div>
                        سعر الدورة
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={purchasePriceInput}
                          onChange={(e) => setPurchasePrice(e.target.value)}
                          placeholder="مثال: 299"
                          style={{ ...TAB_INPUT_BASE, height: 46, paddingRight: 13, paddingLeft: 13, flex: 1 }}
                        />
                        <div style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4", whiteSpace: "nowrap" }}>
                          ج.م
                        </div>
                      </div>
                      {pricingError && (
                        <p style={{ fontFamily: FONT, fontSize: 11.5, color: "#D4183D", marginTop: 6 }}>
                          {pricingError}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subscription plans */}
              <AnimatePresence>
                {state.accessType === "SUBSCRIPTION" && (
                  <motion.div
                    key="sp"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: "hidden" }}
                  >
                    <ModalSection title="خطط الاشتراك" subtitle="حدّد خطط بمدد وأسعار مختلفة" icon={CreditCard}>
                      <SubscriptionPlansSection
                        plans={state.subscriptionPlans}
                        variant="tabs"
                        onAdd={editor.addSubscriptionPlan}
                        onUpdate={editor.updateSubscriptionPlan}
                        onDelete={editor.deleteSubscriptionPlan}
                        error={pricingError}
                      />
                    </ModalSection>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save */}
              <div style={{ display: "flex", gap: 10 }}>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={savePricing}
                  style={{
                    height: 42,
                    paddingLeft: 22,
                    paddingRight: 22,
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
                    boxShadow: "0 3px 12px rgba(78,91,146,0.24)",
                  }}
                >
                  <Save size={13} /> حفظ التعديلات
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ERROR OVERLAY ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editor.errorMessage !== null && (
          <ErrorOverlay message={editor.errorMessage} onRetry={editor.retryError} onClose={editor.dismissError} />
        )}
      </AnimatePresence>
    </div>
  );
}
