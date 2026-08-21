import { useCallback, useState } from "react";
import { useCourseEditor } from "@/features/course/Instructor/course-editor/hooks/use-course-editor";
import type { LessonDraft } from "@/features/course/Instructor/course-editor/types/course-editor.types";
import type { StepId } from "../components/step-indicator";

interface UseCreateCourseArgs {
  onCancel?: () => void;
}

/**
 * The create wizard's own view state on top of the shared course editor.
 *
 * Everything about the course itself — metadata, structure, lessons, exams, pricing —
 * lives in `useCourseEditor`; what belongs here is which step is showing and which
 * inline lesson form is open.
 */
export function useCreateCourse({ onCancel }: UseCreateCourseArgs) {
  const editor = useCourseEditor({ type: "CREATE" });

  const [step, setStep] = useState<StepId>(1);
  const [lessonFormOpen, setLessonFormOpen] = useState(false);
  const [lessonEditKey, setLessonEditKey] = useState<string | null>(null);

  const { setErrors, validateWizardStep } = editor;

  const goNext = useCallback(() => {
    const message = validateWizardStep(step);
    if (message) {
      setErrors({ step: message });
      return;
    }
    setErrors({});
    setStep((s) => Math.min(6, s + 1) as StepId);
  }, [setErrors, step, validateWizardStep]);

  const goPrev = useCallback(() => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1) as StepId);
  }, [setErrors]);

  /** The rail and the review shortcuts only ever move backwards. */
  const goToStep = useCallback(
    (target: StepId) => {
      if (target > step) return;
      setErrors({});
      setStep(target);
    },
    [setErrors, step],
  );

  const openAddLesson = useCallback(() => {
    setLessonEditKey(null);
    setLessonFormOpen(true);
  }, []);

  const openEditLesson = useCallback((key: string) => {
    setLessonEditKey(key);
    setLessonFormOpen(true);
  }, []);

  const closeLessonForm = useCallback(() => {
    setLessonFormOpen(false);
    setLessonEditKey(null);
  }, []);

  const { addLesson, updateLesson } = editor;

  const saveLesson = useCallback(
    (draft: LessonDraft) => {
      if (lessonEditKey) updateLesson(lessonEditKey, draft);
      else addLesson(draft);
      closeLessonForm();
    },
    [addLesson, closeLessonForm, lessonEditKey, updateLesson],
  );

  const saveModuleLesson = useCallback(
    (moduleKey: string, lessonKey: string | null, draft: LessonDraft) => {
      if (lessonKey) editor.updateModuleLesson(moduleKey, lessonKey, draft);
      else editor.addModuleLesson(moduleKey, draft);
    },
    [editor],
  );

  const handleCancel = useCallback(() => {
    if (editor.isDirty && !window.confirm("لديك تغييرات غير محفوظة. هل تريد المغادرة بدون حفظ؟")) return;
    onCancel?.();
  }, [editor.isDirty, onCancel]);

  const handleSuccessClose = useCallback(() => {
    editor.setShowSuccess(false);
    onCancel?.();
  }, [editor, onCancel]);

  return {
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
    publish: () => editor.submitCourse("PUBLISHED"),
    saveDraft: () => editor.submitCourse("DRAFT"),
  };
}
