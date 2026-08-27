import { motion, AnimatePresence } from "motion/react";
import {
  AlignLeft,
  Award,
  BookOpen,
  CreditCard,
  DollarSign,
  FileText,
  Layers,
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
    <div dir="rtl" style={{ fontFamily: FONT }}>
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
          >
            <SectionCard icon={BookOpen} title="معلومات الدورة" subtitle="البيانات الأساسية التي يراها الطلاب">
              <div className="flex flex-col gap-6">
                <Field label="اسم الدورة" required error={errors.title}>
                  <div className="relative">
                    <input
                      type="text"
                      value={state.title}
                      onChange={(e) => editor.setTitle(e.target.value)}
                      placeholder="مثال: أساسيات البرمجة"
                      style={{ ...inputStyle(!!state.title, !!errors.title), height: 50, paddingRight: 46 }}
                    />
                    <div
                      className="absolute top-1/2 right-3.5 flex items-center justify-center"
                      style={{
                        transform: "translateY(-50%)",
                        color: errors.title ? "#D4183D" : state.title ? PRIMARY : "#C4C9DC",
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
                <ImageUpload
                  value={imageFile}
                  preview={coverPreview}
                  onChange={(file, preview) =>
                    file ? editor.setImage(file, preview) : editor.clearImage()
                  }
                />
              </div>
            </SectionCard>
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
          >
            <SectionCard icon={Layers} title="تنظيم المحتوى" subtitle="كيف تريد تنظيم محتوى دورتك؟">
              <StructureSection value={state.structure} onChange={editor.setStructure} />
            </SectionCard>
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
          >
            <SectionCard
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
            </SectionCard>
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
          >
            <SectionCard icon={Award} title="الاختبارات" subtitle="أضف اختبارات للدروس والوحدات والاختبار النهائي">
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
            </SectionCard>
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
          >
            <SectionCard icon={CreditCard} title="طريقة الوصول إلى الدورة" subtitle="حدّد كيف يصل الطلاب إلى دورتك">
              <AccessTypeSection value={state.accessType} onChange={editor.setAccessType} />
            </SectionCard>
            <AnimatePresence>
              {state.accessType !== "FREE" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <SectionCard
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
                  </SectionCard>
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24, paddingBottom: 16 }}>
        {step > 1 && (
          <button
            onClick={goPrev}
            style={{
              height: 48,
              paddingLeft: 22,
              paddingRight: 22,
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
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 10l4-3-4-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            السابق
          </button>
        )}

        {step < 6 ? (
          <motion.button
            onClick={goNext}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              height: 48,
              paddingLeft: 28,
              paddingRight: 28,
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
              gap: 8,
            }}
          >
            التالي
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 4l-4 3 4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <motion.button
              onClick={publish}
              disabled={isSaving}
              whileHover={!isSaving ? { y: -2 } : {}}
              whileTap={!isSaving ? { scale: 0.97 } : {}}
              style={{
                height: 48,
                paddingLeft: 28,
                paddingRight: 28,
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
                gap: 8,
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
              whileHover={!isSaving ? { y: -1 } : {}}
              style={{
                height: 48,
                paddingLeft: 20,
                paddingRight: 20,
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
                gap: 7,
              }}
            >
              <FileText size={14} /> حفظ كمسودة
            </motion.button>
          </div>
        )}

        <button
          onClick={handleCancel}
          style={{
            height: 48,
            paddingLeft: 18,
            paddingRight: 18,
            borderRadius: 14,
            background: "transparent",
            color: "#9BA3C4",
            border: "1.5px solid rgba(78,91,146,0.1)",
            cursor: "pointer",
            fontFamily: FONT,
            fontSize: 13,
            marginRight: "auto",
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}
