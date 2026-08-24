import { useCallback, useState } from "react";
import { useCourseEditor } from "@/features/course/Instructor/course-editor/hooks/use-course-editor";
import type { LessonDraft } from "@/features/course/Instructor/course-editor/types/course-editor.types";
import type { CourseEditorTab } from "@/shared/navigation";

export type CourseTab = CourseEditorTab;

interface UseAddLessonsArgs {
  courseId: string;
  /**
   * Which tab is open, and how to open another one.
   *
   * Both come from the route rather than from state held here: the tab is a section of
   * the course with an address of its own, so it has to survive a reload and answer to
   * Back like any other navigation.
   */
  activeTab: CourseTab;
  onTabChange: (tab: CourseTab) => void;
}

/**
 * The course editor screen's view state on top of the shared editor.
 *
 * The course itself lives in `useCourseEditor`, which loads the aggregate once and
 * saves it back whole. What this hook adds is which tab is open, which inline lesson
 * form is showing, and the two inline messages the reference puts next to the publish
 * and pricing actions.
 */
export function useAddLessons({ courseId, activeTab, onTabChange }: UseAddLessonsArgs) {
  const editor = useCourseEditor({ type: "EDIT", courseId });

  const setActiveTab = onTabChange;
  const [lessonFormOpen, setLessonFormOpen] = useState(false);
  const [lessonEditKey, setLessonEditKey] = useState<string | null>(null);
  const [publishError, setPublishError] = useState("");
  const [pricingError, setPricingError] = useState("");
  const [infoSaved, setInfoSaved] = useState(false);

  const openAddLesson = useCallback(() => {
    setLessonEditKey(null);
    setLessonFormOpen(true);
  }, []);

  const openEditLesson = useCallback((key: string) => {
    setLessonFormOpen(false);
    setLessonEditKey(key);
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

  const deleteLesson = useCallback(
    (key: string) => {
      editor.deleteLesson(key);
      if (lessonEditKey === key) setLessonEditKey(null);
    },
    [editor, lessonEditKey],
  );

  /** Overview's "حفظ التعديلات": one aggregate `PUT`, then the inline confirmation. */
  const saveOverview = useCallback(async () => {
    if (await editor.saveAggregate()) setInfoSaved(true);
  }, [editor]);

  /** Pricing's "حفظ التعديلات": validates the access mode before the same `PUT`. */
  const savePricing = useCallback(async () => {
    const message = editor.validatePricing();
    if (message) {
      setPricingError(message);
      return;
    }
    setPricingError("");
    await editor.saveAggregate();
  }, [editor]);

  const setAccessType = useCallback(
    (accessType: Parameters<typeof editor.setAccessType>[0]) => {
      editor.setAccessType(accessType);
      setPricingError("");
    },
    [editor],
  );

  const setPurchasePrice = useCallback(
    (value: string) => {
      editor.setPurchasePrice(value);
      setPricingError("");
    },
    [editor],
  );

  /**
   * Publishing checks the same things the reference does, and sends the instructor to
   * the tab that needs attention when one fails.
   */
  const publish = useCallback(async () => {
    if (!editor.state.title.trim()) {
      setPublishError("أدخل عنوان الدورة أولاً");
      setActiveTab("overview");
      return;
    }
    if (editor.totalLessons === 0) {
      setPublishError("أضف درسًا واحدًا على الأقل قبل النشر");
      setActiveTab("content");
      return;
    }
    const pricingMessage = editor.validatePricing();
    if (pricingMessage) {
      setPublishError(pricingMessage);
      setActiveTab("pricing");
      return;
    }
    setPublishError("");
    await editor.setStatus("PUBLISHED");
  }, [editor, setActiveTab]);

  const unpublish = useCallback(async () => {
    setPublishError("");
    await editor.setStatus("DRAFT");
  }, [editor]);

  return {
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
  };
}
