import { motion, AnimatePresence } from "motion/react";
import {
  AlignLeft,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileText,
  Layers,
  Lock,
  Sparkles,
} from "lucide-react";
import { ErrorOverlay } from "@/shared/components/ErrorOverlay/ErrorOverlay";
import {
  AccessTypeSection,
} from "@/features/course/Instructor/course-editor/components/access-type-section";
import { CourseExamsEditor } from "@/features/course/Instructor/course-editor/components/course-exams-editor";
import { FlatCurriculumSection } from "@/features/course/Instructor/course-editor/components/flat-curriculum-section";
import { Field } from "@/features/course/Instructor/course-editor/components/field";
import { ImageUpload } from "@/features/course/Instructor/course-editor/components/image-upload";
import { ModuleCurriculumSection } from "@/features/course/Instructor/course-editor/components/module-curriculum-section";
import { SectionCard } from "@/features/course/Instructor/course-editor/components/section-card";
import { StructureSection } from "@/features/course/Instructor/course-editor/components/structure-section";
import { VisibilitySection } from "@/features/course/Instructor/course-editor/components/visibility-section";
import {
  PurchasePricing,
  SubscriptionPlansSection,
} from "@/features/course/Instructor/course-editor/components/subscription-plans-section";
import { FONT, PRIMARY, inputStyle } from "@/features/course/Instructor/course-editor/components/editor-theme";
import type { useCreateCourse } from "../hooks/use-create-course";
import { ReviewSection } from "./review-section";
import { StepIndicator } from "./step-indicator";
import { SuccessOverlay } from "./success-overlay";

type CreateCourseController = ReturnType<typeof useCreateCourse>;

const CREATE_COURSE_RESPONSIVE_CSS = `
  .ccw {
    inline-size: 100%;
    max-inline-size: 100%;
    min-inline-size: 0;
  }

  .ccw,
  .ccw * {
    box-sizing: border-box;
  }

  .ccw :where(input, textarea, select, button) {
    max-inline-size: 100%;
  }

  .ccw :where(input, textarea, select) {
    min-inline-size: 0;
  }

  .ccw :where(p, span, label, h1, h2, h3, div) {
    overflow-wrap: anywhere;
  }

  .ccw :where(button) {
    touch-action: manipulation;
  }

  .ccw-step-panel,
  .ccw-step-panel > *,
  .ccw-card-shell,
  .ccw-card-shell > * {
    min-inline-size: 0;
    max-inline-size: 100%;
  }

  .ccw-card-shell > [style] {
    padding: clamp(18px, 5vw, 32px) !important;
    border-radius: clamp(16px, 4vw, 24px) !important;
  }

  .ccw-card-shell > [style] > .flex:first-child {
    align-items: flex-start;
    min-inline-size: 0;
  }

  .ccw-card-shell > [style] > .flex:first-child > div:last-child {
    min-inline-size: 0;
  }

  .ccw-stackable-control > .flex {
    flex-wrap: wrap;
    align-items: stretch;
  }

  .ccw-stackable-control > .flex > button {
    flex: 1 1 min(240px, 100%) !important;
    min-inline-size: min(240px, 100%);
  }

  .ccw-stackable-control > .flex > button > .flex,
  .ccw-stackable-control > .flex > button > .flex > div:last-child {
    min-inline-size: 0;
  }

  .ccw-curriculum-surface [style*="display: flex"][style*="align-items: center"],
  .ccw-access-surface [style*="display: flex"][style*="align-items: center"],
  .ccw-pricing-surface [style*="display: flex"][style*="align-items: center"],
  .ccw-quiz-surface [style*="display: flex"][style*="align-items: center"] {
    flex-wrap: wrap;
    min-inline-size: 0;
  }

  .ccw-curriculum-surface .items-stretch {
    flex-wrap: wrap;
  }

  .ccw-curriculum-surface .items-stretch > .flex-1 {
    flex: 1 1 min(180px, 100%) !important;
    min-inline-size: 0;
  }

  .ccw-access-surface [style*="flex: 1"],
  .ccw-pricing-surface [style*="flex: 1"],
  .ccw-quiz-surface [style*="flex: 1"] {
    min-inline-size: 0;
  }

  .ccw-curriculum-surface [style*="padding: 28px 28px 24px"],
  .ccw-curriculum-surface [style*="padding: 22px 22px 20px"],
  .ccw-pricing-surface [style*="padding: 22px 22px 20px"],
  .ccw-quiz-surface [style*="padding: 24px"],
  .ccw-quiz-surface [style*="padding: 20px 22px"] {
    padding: clamp(16px, 5vw, 24px) !important;
  }

  .ccw-curriculum-surface [style*="width: 112px"] {
    inline-size: min(112px, 42vw) !important;
  }

  .ccw-curriculum-surface [style*="height: 68px"] {
    block-size: auto;
    aspect-ratio: 112 / 68;
  }

  .ccw-pricing-surface .flex.items-center,
  .ccw-pricing-surface .flex.gap-2,
  .ccw-quiz-surface .justify-between,
  .ccw-quiz-surface .items-end,
  .ccw-quiz-surface .items-start {
    flex-wrap: wrap;
  }

  .ccw-quiz-surface .items-end {
    align-items: flex-start;
  }

  .ccw-pricing-surface input {
    flex: 1 1 min(180px, 100%);
  }

  .ccw-pricing-surface [style*="width: 100px"] {
    inline-size: min(100px, 100%) !important;
  }

  .ccw-pricing-surface [style*="max-width: 200px"],
  .ccw-quiz-surface [style*="max-width: 180px"] {
    max-inline-size: 100% !important;
  }

  .ccw-quiz-surface [style*="max-width: 180px"] {
    flex: 1 1 min(180px, 100%);
  }

  .ccw-image-field .absolute.bottom-3 {
    flex-wrap: wrap;
    gap: 8px;
  }

  @media (pointer: coarse) {
    .ccw button {
      position: relative;
    }

    .ccw button::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      translate: -50% -50%;
      inline-size: 100%;
      block-size: 100%;
      min-inline-size: 44px;
      min-block-size: 44px;
    }
  }
`;

function WizardSection({
  className,
  ...props
}: React.ComponentProps<typeof SectionCard> & { className?: string }) {
  return (
    <div className={["ccw-card-shell", className].filter(Boolean).join(" ")}>
      <SectionCard {...props} />
    </div>
  );
}

/**
 * The six-step create wizard, exactly as the reference draws it. Every section is a
 * shared course-editor component, so the same content, exam and pricing surfaces
 * appear here and in the course editor's tabs.
 */
export function CourseEditorWizard({
  editor,
  step,
  lessonFormOpen,
  lessonEditKey,
  goNext,
  goPrev,
  goToStep,
  openAddLesson,
  openEditLesson,
  closeLessonForm,
  saveLesson,
  saveModuleLesson,
  handleCancel,
  handleSuccessClose,
  publish,
  saveDraft,
}: CreateCourseController) {
  const { state, errors, imageFile, imagePreview, purchasePriceInput, isSaving } = editor;
  const coverPreview = imagePreview ?? (state.image || null);

  return (
    <div dir="rtl" className="ccw rs-longform" style={{ fontFamily: FONT }}>
      <style>{CREATE_COURSE_RESPONSIVE_CSS}</style>

      {/* ── STEPPER ── */}
      <StepIndicator current={step} onGoTo={goToStep} />

      {/* ── STEP ERROR ── */}
      <AnimatePresence>
        {errors.step && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: 14,
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(212,24,61,0.06)",
              border: "1px solid rgba(212,24,61,0.2)",
              fontFamily: FONT,
              fontSize: 12.5,
              color: "#D4183D",
              overflowWrap: "anywhere",
              minInlineSize: 0,
            }}
          >
            {errors.step}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STEP CONTENT ── */}
      <AnimatePresence mode="wait">
        {/* STEP 1 — معلومات الدورة */}
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="ccw-step-panel"
          >
            <WizardSection icon={BookOpen} title="معلومات الدورة" subtitle="البيانات الأساسية التي يراها الطلاب">
              <div className="flex flex-col gap-6">
                <Field label="اسم الدورة" required error={errors.title}>
                  <div className="relative">
                    <input
                      type="text"
                      value={state.title}
                      onChange={(e) => editor.setTitle(e.target.value)}
                      placeholder="مثال: أساسيات البرمجة"
                      style={{
                        ...inputStyle(!!state.title, !!errors.title),
                        height: 50,
                        paddingInlineStart: 46,
                        paddingInlineEnd: 14,
                      }}
                    />
                    <div
                      className="absolute top-1/2 flex items-center justify-center"
                      style={{
                        transform: "translateY(-50%)",
                        color: errors.title ? "#D4183D" : state.title ? PRIMARY : "#C4C9DC",
                        insetInlineStart: 14,
                      }}
                    >
                      <BookOpen size={16} />
                    </div>
                  </div>
                </Field>
                <Field label="وصف الدورة" required error={errors.description}>
                  <textarea
                    value={state.description}
                    onChange={(e) => editor.setDescription(e.target.value)}
                    placeholder="اكتب وصفًا مختصرًا عن الدورة وما سيتعلمه الطلاب..."
                    rows={4}
                    style={{
                      ...inputStyle(!!state.description, !!errors.description),
                      height: "auto",
                      padding: "14px 16px",
                      resize: "vertical",
                      minHeight: 110,
                      lineHeight: 1.75,
                    }}
                  />
                </Field>
                <div className="ccw-image-field">
                  <ImageUpload
                    value={imageFile}
                    preview={coverPreview}
                    onChange={(file, preview) =>
                      file ? editor.setImage(file, preview) : editor.clearImage()
                    }
                  />
                </div>
              </div>
            </WizardSection>
          </motion.div>
        )}

        {/* STEP 2 — تنظيم المحتوى */}
        {step === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="ccw-step-panel"
          >
            <WizardSection icon={Layers} title="تنظيم المحتوى" subtitle="كيف تريد تنظيم محتوى دورتك؟">
              <div className="ccw-stackable-control">
                <StructureSection value={state.structure} onChange={editor.setStructure} />
              </div>
            </WizardSection>

            {/*
              Visibility, offered here at creation and editable afterwards from the course
              editor's overview tab. One setting, two entry points to the same field — not
              two controls that could disagree.

              It starts on "عامة", which is the backend's default too: a course an author
              says nothing about is a course on offer to everyone, exactly as every course
              on the platform was before this existed.
            */}
            <WizardSection
              icon={Lock}
              title="ظهور الدورة"
              subtitle="من يمكنه اكتشاف هذه الدورة؟"
              delay={0.06}
            >
              <div className="ccw-stackable-control">
                <VisibilitySection value={state.visibility} onChange={editor.setVisibility} />
              </div>
            </WizardSection>
          </motion.div>
        )}

        {/* STEP 3 — المحتوى */}
        {step === 3 && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="ccw-step-panel"
          >
            <WizardSection
              className="ccw-curriculum-surface"
              icon={AlignLeft}
              title="محتوى الدورة"
              subtitle={
                state.structure === "FLAT" ? "أضف وأعد ترتيب دروس دورتك" : "أضف وحدات وادرج الدروس بداخلها"
              }
            >
              <AnimatePresence mode="wait">
                {state.structure === "FLAT" ? (
                  <motion.div
                    key="flat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FlatCurriculumSection
                      lessons={state.lessons}
                      formOpen={lessonFormOpen}
                      editKey={lessonEditKey}
                      onOpenAdd={openAddLesson}
                      onOpenEdit={openEditLesson}
                      onCloseForm={closeLessonForm}
                      onSaveLesson={saveLesson}
                      onDeleteLesson={editor.deleteLesson}
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
                    transition={{ duration: 0.2 }}
                  >
                    <ModuleCurriculumSection
                      modules={state.modules}
                      onAddModule={editor.addModule}
                      onUpdateModule={editor.updateModule}
                      onDeleteModule={editor.deleteModule}
                      onReorderModules={editor.reorderModules}
                      onReorderModulesCommit={editor.commitModuleOrder}
                      onSaveModuleLesson={saveModuleLesson}
                      onDeleteModuleLesson={editor.deleteModuleLesson}
                      onReorderModuleLessons={editor.reorderModuleLessons}
                      onReorderModuleLessonsCommit={editor.commitModuleLessonOrder}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </WizardSection>
          </motion.div>
        )}

        {/* STEP 4 — الاختبارات */}
        {step === 4 && (
          <motion.div
            key="s4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="ccw-step-panel"
          >
            <WizardSection
              className="ccw-quiz-surface"
              icon={Award}
              title="الاختبارات"
              subtitle="أضف اختبارات للدروس والوحدات والاختبار النهائي"
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
            </WizardSection>
          </motion.div>
        )}

        {/* STEP 5 — السعر والوصول */}
        {step === 5 && (
          <motion.div
            key="s5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="ccw-step-panel"
          >
            <WizardSection
              className="ccw-access-surface"
              icon={CreditCard}
              title="طريقة الوصول إلى الدورة"
              subtitle="حدّد كيف يصل الطلاب إلى دورتك"
            >
              <AccessTypeSection value={state.accessType} onChange={editor.setAccessType} />
            </WizardSection>
            <AnimatePresence>
              {state.accessType !== "FREE" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <WizardSection
                    className="ccw-pricing-surface"
                    icon={DollarSign}
                    title={state.accessType === "PURCHASE" ? "التسعير" : "خطط الاشتراك"}
                    subtitle={
                      state.accessType === "PURCHASE"
                        ? "حدد سعر الدورة بالجنيه المصري"
                        : "أضف خطط اشتراك بأسعار ومدد مختلفة"
                    }
                  >
                    {state.accessType === "PURCHASE" ? (
                      <PurchasePricing
                        price={purchasePriceInput}
                        onPriceChange={editor.setPurchasePrice}
                        error={errors.purchasePrice}
                      />
                    ) : (
                      <SubscriptionPlansSection
                        plans={state.subscriptionPlans}
                        onAdd={editor.addSubscriptionPlan}
                        onUpdate={editor.updateSubscriptionPlan}
                        onDelete={editor.deleteSubscriptionPlan}
                        error={errors.subscriptionPlans}
                      />
                    )}
                  </WizardSection>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 6 — المراجعة والنشر */}
        {step === 6 && (
          <motion.div
            key="s6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="ccw-step-panel"
          >
            <ReviewSection
              state={state}
              purchasePrice={purchasePriceInput}
              hasCoverImage={!!coverPreview}
              onGoToStep={goToStep}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NAV BUTTONS ── */}
      <div
        className="rs-cluster ccw-nav-actions"
        style={{ "--rs-cluster-gap": "10px", marginTop: 24, paddingBlockEnd: 16 } as React.CSSProperties}
      >
        {step > 1 && (
          <button
            onClick={goPrev}
            className="rs-touch"
            style={{
              minHeight: 48,
              paddingInline: 22,
              borderRadius: 14,
              background: "transparent",
              color: "#717182",
              border: "1.5px solid rgba(78,91,146,0.2)",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 7,
              transition: "all 0.15s",
              flex: "0 1 auto",
              minInlineSize: "min(108px, 100%)",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = PRIMARY;
              e.currentTarget.style.borderColor = "rgba(78,91,146,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#717182";
              e.currentTarget.style.borderColor = "rgba(78,91,146,0.2)";
            }}
          >
            <ChevronRight size={15} />
            السابق
          </button>
        )}

        {step < 6 ? (
          <motion.button
            onClick={goNext}
            className="rs-touch"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              minHeight: 48,
              paddingInline: 28,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 4px 14px rgba(78,91,146,0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              flex: "0 1 auto",
              minInlineSize: "min(118px, 100%)",
            }}
          >
            التالي
            <ChevronLeft size={15} />
          </motion.button>
        ) : (
          <div
            className="rs-cluster"
            style={{ "--rs-cluster-gap": "10px", flex: "1 1 300px", minInlineSize: 0 } as React.CSSProperties}
          >
            <motion.button
              onClick={publish}
              disabled={isSaving}
              className="rs-touch"
              whileHover={!isSaving ? { y: -2 } : {}}
              whileTap={!isSaving ? { scale: 0.97 } : {}}
              style={{
                minHeight: 48,
                paddingInline: 28,
                borderRadius: 14,
                background: isSaving ? "rgba(78,91,146,0.5)" : `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
                color: "#fff",
                border: "none",
                cursor: isSaving ? "not-allowed" : "pointer",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 4px 16px rgba(78,91,146,0.32)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                flex: "1 1 140px",
                minInlineSize: "min(140px, 100%)",
              }}
            >
              {isSaving ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <path d="M7 2a5 5 0 0 1 5 5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  جارٍ النشر...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> نشر الدورة
                </>
              )}
            </motion.button>
            <motion.button
              onClick={saveDraft}
              disabled={isSaving}
              className="rs-touch"
              whileHover={!isSaving ? { y: -1 } : {}}
              style={{
                minHeight: 48,
                paddingInline: 20,
                borderRadius: 14,
                background: "transparent",
                color: "#717182",
                border: "1.5px solid rgba(78,91,146,0.22)",
                cursor: isSaving ? "not-allowed" : "pointer",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                flex: "1 1 128px",
                minInlineSize: "min(128px, 100%)",
              }}
            >
              <FileText size={14} /> حفظ كمسودة
            </motion.button>
          </div>
        )}

        <button
          onClick={handleCancel}
          className="rs-touch"
          style={{
            minHeight: 48,
            paddingInline: 18,
            borderRadius: 14,
            background: "transparent",
            color: "#9BA3C4",
            border: "1.5px solid rgba(78,91,146,0.1)",
            cursor: "pointer",
            fontFamily: FONT,
            fontSize: 13,
            marginInlineStart: "auto",
            flex: "0 1 auto",
            minInlineSize: "min(82px, 100%)",
          }}
        >
          إلغاء
        </button>
      </div>

      {/* ── SUCCESS OVERLAY ── */}
      <AnimatePresence>
        {editor.showSuccess && <SuccessOverlay title={state.title} onClose={handleSuccessClose} />}
      </AnimatePresence>

      {/* ── ERROR OVERLAY ── */}
      <AnimatePresence>
        {editor.errorMessage !== null && (
          <ErrorOverlay
            message={editor.errorMessage}
            onRetry={editor.retryError}
            onClose={editor.dismissError}
            title={editor.errorKind === "VERSION_CONFLICT" ? "الدورة تغيّرت في مكان آخر" : undefined}
            retryLabel={editor.errorKind === "VERSION_CONFLICT" ? "إعادة تحميل أحدث نسخة" : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
