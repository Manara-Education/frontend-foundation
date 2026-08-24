import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/shared/api";
import {
  createEditorKey,
  createEmptyCourseEditorState,
  type CourseAccessType,
  type CourseEditorState,
  type CourseLessonEditorState,
  type CourseModuleEditorState,
  type CourseStatus,
  type CourseStructure,
  type QuizEditorState,
} from "@/shared/courses";
import { courseEditorService } from "../services/course-editor.service";
import type {
  CourseEditorErrors,
  CourseEditorMode,
  LessonDraft,
  ModuleDraft,
  SubscriptionPlanDraft,
} from "../types/course-editor.types";

function extractErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.errors.join("، ") || err.message;
  if (err instanceof Error && err.message) return err.message;
  return "تعذّر إكمال العملية. يرجى المحاولة مرة أخرى.";
}

function emptyLesson(draft: LessonDraft): CourseLessonEditorState {
  return {
    key: createEditorKey(),
    id: null,
    title: draft.title,
    // No reference screen edits `summary`, so a new lesson starts without one and an
    // existing lesson keeps whatever the backend already has (see `applyLessonDraft`).
    summary: "",
    description: draft.description,
    videoUrl: draft.videoUrl,
    // A lesson that has never been saved has no server-resolved still yet. YouTube's is
    // derivable from the URL anyway; Vimeo's arrives with the next response.
    videoThumbnailUrl: null,
    quiz: draft.quiz,
  };
}

function applyLessonDraft(
  lesson: CourseLessonEditorState,
  draft: LessonDraft,
): CourseLessonEditorState {
  return {
    ...lesson,
    title: draft.title,
    description: draft.description,
    videoUrl: draft.videoUrl,
    // Pointing a lesson at a different video invalidates the still the server resolved for
    // the previous one; the next save re-resolves it.
    videoThumbnailUrl: draft.videoUrl === lesson.videoUrl ? lesson.videoThumbnailUrl : null,
    quiz: draft.quiz,
  };
}

function emptyModule(draft: ModuleDraft): CourseModuleEditorState {
  return {
    key: createEditorKey(),
    id: null,
    title: draft.title,
    description: draft.description,
    lessons: [],
    quiz: null,
  };
}

/**
 * Detaches content from the rows the backend no longer has.
 *
 * Saving a course whose `structure` is `MODULES` deletes its flat lessons, and the
 * other way round. The editor keeps that branch so switching back does not lose what
 * was typed — but its `id`s now point at deleted rows, and sending one back is a
 * "lesson does not belong to this course" error. Clearing them turns the branch into
 * new content, which is what it has become.
 */
function detachPersistedIds<T extends { id: number | null; quiz: QuizEditorState | null }>(
  item: T,
): T {
  return {
    ...item,
    id: null,
    quiz: item.quiz ? { ...item.quiz, id: null } : null,
  };
}

/**
 * Re-labels a saved course with the keys the editor was already using.
 *
 * The aggregate response is authoritative for values and ids, but its keys are derived
 * from those ids — adopting them wholesale would remount every list row and collapse
 * the module the instructor is working in. Positions match because the request was
 * built from this exact state.
 */
function withEditorKeys(local: CourseEditorState, saved: CourseEditorState): CourseEditorState {
  const lessons = saved.lessons.map((lesson, index) => ({
    ...lesson,
    key: local.lessons[index]?.key ?? lesson.key,
  }));

  const modules = saved.modules.map((module, index) => ({
    ...module,
    key: local.modules[index]?.key ?? module.key,
    lessons: module.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      key: local.modules[index]?.lessons[lessonIndex]?.key ?? lesson.key,
    })),
  }));

  return {
    ...saved,
    lessons: saved.structure === "FLAT" ? lessons : local.lessons.map(detachPersistedIds),
    modules:
      saved.structure === "MODULES"
        ? modules
        : local.modules.map((module) => ({
            ...detachPersistedIds(module),
            lessons: module.lessons.map(detachPersistedIds),
          })),
    subscriptionPlans: saved.subscriptionPlans.map((plan, index) => ({
      ...plan,
      key: local.subscriptionPlans[index]?.key ?? plan.key,
    })),
  };
}

/**
 * The one editor behind both instructor course screens.
 *
 * `CREATE` holds everything in memory until the wizard's publish/draft action sends a
 * single `POST`. `EDIT` hydrates from the aggregate `GET` and persists through a single
 * `PUT` whenever the instructor completes an action the reference UI treats as a save —
 * saving a lesson or a quiz, adding or removing a module, reordering, or pressing one of
 * the "حفظ التعديلات" / publish buttons. Either way the whole course tree travels in one
 * request; no screen posts a nested entity on its own.
 */
export function useCourseEditor(mode: CourseEditorMode) {
  const courseId = mode.type === "EDIT" ? Number(mode.courseId) : null;

  const [state, setState] = useState<CourseEditorState>(createEmptyCourseEditorState);
  const stateRef = useRef(state);

  const [isLoading, setIsLoading] = useState(mode.type === "EDIT");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<CourseEditorErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageFileRef = useRef<File | null>(null);

  const lastFailedActionRef = useRef<(() => void) | null>(null);

  const reportError = useCallback((err: unknown, retry?: () => void) => {
    console.error(err);
    lastFailedActionRef.current = retry ?? null;
    setErrorMessage(extractErrorMessage(err));
  }, []);

  const dismissError = useCallback(() => {
    lastFailedActionRef.current = null;
    setErrorMessage(null);
  }, []);

  const retryError = useCallback(() => {
    const action = lastFailedActionRef.current;
    lastFailedActionRef.current = null;
    setErrorMessage(null);
    action?.();
  }, []);

  const writeState = useCallback((next: CourseEditorState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  // ── Load (EDIT only) ────────────────────────────────────────────────────────

  const loadCourse = useCallback(async () => {
    if (courseId === null || Number.isNaN(courseId)) return;
    setIsLoading(true);
    try {
      writeState(await courseEditorService.loadCourse(courseId));
    } catch (err) {
      reportError(err, () => void loadCourse());
    } finally {
      setIsLoading(false);
    }
  }, [courseId, reportError, writeState]);

  useEffect(() => {
    if (mode.type === "EDIT") void loadCourse();
    // `loadCourse` is keyed by courseId, which is what should re-trigger a load.
  }, [mode.type, loadCourse]);

  // ── Aggregate save ──────────────────────────────────────────────────────────

  /**
   * Sends the whole course in one request. A pending cover image is uploaded first so
   * the payload carries a URL rather than a blob.
   */
  const persist = useCallback(
    async (next: CourseEditorState): Promise<boolean> => {
      setIsSaving(true);
      try {
        let payload = next;

        if (imageFileRef.current) {
          const url = await courseEditorService.uploadCourseImage(imageFileRef.current);
          payload = { ...payload, image: url };
          imageFileRef.current = null;
          setImageFile(null);
          setImagePreview(null);
        }

        // `payload.id` is set once a create has landed, so a second submit from the
        // wizard updates the course it just made instead of creating another one.
        const targetId = courseId ?? payload.id;
        const saved =
          targetId !== null
            ? await courseEditorService.updateCourse(targetId, payload)
            : await courseEditorService.createCourse(payload);

        writeState(withEditorKeys(payload, saved));
        setIsDirty(false);
        return true;
      } catch (err) {
        reportError(err, () => void persist(next));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [courseId, reportError, writeState],
  );

  /**
   * Applies a change and, in `EDIT`, persists the resulting aggregate.
   *
   * `persistNow` marks the actions the reference UI presents as a save — a lesson form
   * submitted, a quiz saved, a module added, a list reordered. Keystrokes never persist.
   */
  const mutate = useCallback(
    (updater: (prev: CourseEditorState) => CourseEditorState, persistNow = false) => {
      const next = updater(stateRef.current);
      writeState(next);
      setIsDirty(true);
      if (persistNow && courseId !== null) void persist(next);
      return next;
    },
    [courseId, persist, writeState],
  );

  // ── Metadata ────────────────────────────────────────────────────────────────

  const setTitle = useCallback(
    (title: string) => {
      mutate((prev) => ({ ...prev, title }));
      setErrors((prev) => ({ ...prev, title: undefined, step: undefined }));
    },
    [mutate],
  );

  const setDescription = useCallback(
    (description: string) => {
      mutate((prev) => ({ ...prev, description }));
      setErrors((prev) => ({ ...prev, description: undefined, step: undefined }));
    },
    [mutate],
  );

  /** A picked file is previewed straight away and uploaded on the next aggregate save. */
  const setImage = useCallback((file: File | null, preview: string | null) => {
    imageFileRef.current = file;
    setImageFile(file);
    setImagePreview(preview);
    setIsDirty(true);
  }, []);

  const clearImage = useCallback(() => {
    imageFileRef.current = null;
    setImageFile(null);
    setImagePreview(null);
    mutate((prev) => ({ ...prev, image: "" }));
  }, [mutate]);

  /** Both content branches survive the switch; only the active one is ever sent. */
  const setStructure = useCallback(
    (structure: CourseStructure) => {
      mutate((prev) => ({ ...prev, structure }));
    },
    [mutate],
  );

  // ── Flat lessons ────────────────────────────────────────────────────────────

  const addLesson = useCallback(
    (draft: LessonDraft) => mutate((prev) => ({ ...prev, lessons: [...prev.lessons, emptyLesson(draft)] }), true),
    [mutate],
  );

  const updateLesson = useCallback(
    (key: string, draft: LessonDraft) =>
      mutate(
        (prev) => ({
          ...prev,
          lessons: prev.lessons.map((l) => (l.key === key ? applyLessonDraft(l, draft) : l)),
        }),
        true,
      ),
    [mutate],
  );

  const deleteLesson = useCallback(
    (key: string) =>
      mutate((prev) => ({ ...prev, lessons: prev.lessons.filter((l) => l.key !== key) }), true),
    [mutate],
  );

  const reorderLessons = useCallback(
    (lessons: CourseLessonEditorState[]) => mutate((prev) => ({ ...prev, lessons })),
    [mutate],
  );

  /** Drag ends: the new order is what gets an `orderIndex` in the next payload. */
  const commitLessonOrder = useCallback(() => mutate((prev) => prev, true), [mutate]);

  const setLessonQuiz = useCallback(
    (key: string, quiz: QuizEditorState | null) =>
      mutate(
        (prev) => ({
          ...prev,
          lessons: prev.lessons.map((l) => (l.key === key ? { ...l, quiz } : l)),
        }),
        true,
      ),
    [mutate],
  );

  // ── Modules ─────────────────────────────────────────────────────────────────

  const addModule = useCallback(
    (draft: ModuleDraft) => {
      const module = emptyModule(draft);
      mutate((prev) => ({ ...prev, modules: [...prev.modules, module] }), true);
      return module.key;
    },
    [mutate],
  );

  const updateModule = useCallback(
    (key: string, draft: ModuleDraft) =>
      mutate(
        (prev) => ({
          ...prev,
          modules: prev.modules.map((m) => (m.key === key ? { ...m, ...draft } : m)),
        }),
        true,
      ),
    [mutate],
  );

  const deleteModule = useCallback(
    (key: string) =>
      mutate((prev) => ({ ...prev, modules: prev.modules.filter((m) => m.key !== key) }), true),
    [mutate],
  );

  const reorderModules = useCallback(
    (modules: CourseModuleEditorState[]) => mutate((prev) => ({ ...prev, modules })),
    [mutate],
  );

  const commitModuleOrder = useCallback(() => mutate((prev) => prev, true), [mutate]);

  const mapModule = useCallback(
    (
      key: string,
      map: (module: CourseModuleEditorState) => CourseModuleEditorState,
      persistNow = true,
    ) =>
      mutate(
        (prev) => ({ ...prev, modules: prev.modules.map((m) => (m.key === key ? map(m) : m)) }),
        persistNow,
      ),
    [mutate],
  );

  const addModuleLesson = useCallback(
    (moduleKey: string, draft: LessonDraft) =>
      mapModule(moduleKey, (m) => ({ ...m, lessons: [...m.lessons, emptyLesson(draft)] })),
    [mapModule],
  );

  const updateModuleLesson = useCallback(
    (moduleKey: string, lessonKey: string, draft: LessonDraft) =>
      mapModule(moduleKey, (m) => ({
        ...m,
        lessons: m.lessons.map((l) => (l.key === lessonKey ? applyLessonDraft(l, draft) : l)),
      })),
    [mapModule],
  );

  const deleteModuleLesson = useCallback(
    (moduleKey: string, lessonKey: string) =>
      mapModule(moduleKey, (m) => ({
        ...m,
        lessons: m.lessons.filter((l) => l.key !== lessonKey),
      })),
    [mapModule],
  );

  const reorderModuleLessons = useCallback(
    (moduleKey: string, lessons: CourseLessonEditorState[]) =>
      mapModule(moduleKey, (m) => ({ ...m, lessons }), false),
    [mapModule],
  );

  const setModuleLessonQuiz = useCallback(
    (moduleKey: string, lessonKey: string, quiz: QuizEditorState | null) =>
      mapModule(moduleKey, (m) => ({
        ...m,
        lessons: m.lessons.map((l) => (l.key === lessonKey ? { ...l, quiz } : l)),
      })),
    [mapModule],
  );

  const setModuleQuiz = useCallback(
    (moduleKey: string, quiz: QuizEditorState | null) =>
      mapModule(moduleKey, (m) => ({ ...m, quiz })),
    [mapModule],
  );

  // ── Final exam ──────────────────────────────────────────────────────────────

  const setFinalQuiz = useCallback(
    (quiz: QuizEditorState | null) => mutate((prev) => ({ ...prev, finalQuiz: quiz }), true),
    [mutate],
  );

  // ── Pricing / access ────────────────────────────────────────────────────────

  const [purchasePriceInput, setPurchasePriceInput] = useState("");

  useEffect(() => {
    setPurchasePriceInput(state.purchasePrice !== null ? String(state.purchasePrice) : "");
  }, [state.purchasePrice]);

  const setAccessType = useCallback(
    (accessType: CourseAccessType) => {
      mutate((prev) => ({ ...prev, accessType }));
      setErrors((prev) => ({
        ...prev,
        purchasePrice: undefined,
        subscriptionPlans: undefined,
        step: undefined,
      }));
    },
    [mutate],
  );

  const setPurchasePrice = useCallback(
    (value: string) => {
      setPurchasePriceInput(value);
      const parsed = parseFloat(value);
      mutate((prev) => ({ ...prev, purchasePrice: Number.isNaN(parsed) ? null : parsed }));
      setErrors((prev) => ({ ...prev, purchasePrice: undefined, step: undefined }));
    },
    [mutate],
  );

  const addSubscriptionPlan = useCallback(
    (draft: SubscriptionPlanDraft) => {
      mutate(
        (prev) => ({
          ...prev,
          subscriptionPlans: [
            ...prev.subscriptionPlans,
            { key: createEditorKey(), id: null, ...draft },
          ],
        }),
        true,
      );
      setErrors((prev) => ({ ...prev, subscriptionPlans: undefined, step: undefined }));
    },
    [mutate],
  );

  const updateSubscriptionPlan = useCallback(
    (key: string, draft: SubscriptionPlanDraft) =>
      mutate(
        (prev) => ({
          ...prev,
          subscriptionPlans: prev.subscriptionPlans.map((p) =>
            p.key === key ? { ...p, ...draft } : p,
          ),
        }),
        true,
      ),
    [mutate],
  );

  const deleteSubscriptionPlan = useCallback(
    (key: string) =>
      mutate(
        (prev) => ({
          ...prev,
          subscriptionPlans: prev.subscriptionPlans.filter((p) => p.key !== key),
        }),
        true,
      ),
    [mutate],
  );

  // ── Validation ──────────────────────────────────────────────────────────────

  const totalLessons =
    state.structure === "FLAT"
      ? state.lessons.length
      : state.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  const validatePricing = useCallback((): string | null => {
    if (state.accessType === "PURCHASE") {
      const price = parseFloat(purchasePriceInput);
      if (!purchasePriceInput || Number.isNaN(price) || price <= 0) {
        return "أدخل سعرًا صحيحًا للدورة المدفوعة";
      }
    }
    if (state.accessType === "SUBSCRIPTION" && state.subscriptionPlans.length === 0) {
      return "أضف خطة اشتراك واحدة على الأقل";
    }
    return null;
  }, [purchasePriceInput, state.accessType, state.subscriptionPlans.length]);

  /** Wizard: the message shown above the current step, or `null` to advance. */
  const validateWizardStep = useCallback(
    (step: number): string | null => {
      if (step === 1) {
        if (!state.title.trim() || state.title.trim().length < 5) {
          return "أدخل اسم الدورة (5 أحرف على الأقل)";
        }
        if (!state.description.trim() || state.description.trim().length < 20) {
          return "أدخل وصفًا (20 حرفاً على الأقل)";
        }
      }
      if (step === 5) return validatePricing();
      return null;
    },
    [state.description, state.title, validatePricing],
  );

  // ── Explicit saves ──────────────────────────────────────────────────────────

  /**
   * The wizard's publish / save-as-draft action. A draft only has to be nameable;
   * publishing also has to price the course, matching the reference validation.
   */
  const submitCourse = useCallback(
    async (status: CourseStatus): Promise<boolean> => {
      const nextErrors: CourseEditorErrors = {};
      if (!state.title.trim() || state.title.trim().length < 5) {
        nextErrors.title = "اسم الدورة يجب أن يكون 5 أحرف على الأقل";
      }
      if (!state.description.trim() || state.description.trim().length < 20) {
        nextErrors.description = "الوصف يجب أن يكون 20 حرفاً على الأقل";
      }
      if (status === "PUBLISHED") {
        if (state.accessType === "PURCHASE") {
          const price = parseFloat(purchasePriceInput);
          if (!purchasePriceInput || Number.isNaN(price) || price <= 0) {
            nextErrors.purchasePrice = "السعر مطلوب للدورات المدفوعة";
          }
        }
        if (state.accessType === "SUBSCRIPTION" && state.subscriptionPlans.length === 0) {
          nextErrors.subscriptionPlans = "أضف خطة اشتراك واحدة على الأقل";
        }
      }
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return false;
      }
      setErrors({});

      const saved = await persist({ ...stateRef.current, status });
      if (saved) setShowSuccess(true);
      return saved;
    },
    [
      persist,
      purchasePriceInput,
      state.accessType,
      state.description,
      state.subscriptionPlans.length,
      state.title,
    ],
  );

  /** The course editor's "حفظ التعديلات" buttons — one aggregate `PUT`. */
  const saveAggregate = useCallback(
    () => persist(stateRef.current),
    [persist],
  );

  /** The course editor's publish / unpublish CTA. */
  const setStatus = useCallback(
    (status: CourseStatus) => persist({ ...stateRef.current, status }),
    [persist],
  );

  return {
    // state
    state,
    totalLessons,
    isLoading,
    isSaving,
    isDirty,
    errors,
    errorMessage,
    showSuccess,
    imageFile,
    imagePreview,
    purchasePriceInput,

    // metadata
    setTitle,
    setDescription,
    setImage,
    clearImage,
    setStructure,

    // flat lessons
    addLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    commitLessonOrder,
    setLessonQuiz,

    // modules
    addModule,
    updateModule,
    deleteModule,
    reorderModules,
    commitModuleOrder,
    addModuleLesson,
    updateModuleLesson,
    deleteModuleLesson,
    reorderModuleLessons,
    setModuleLessonQuiz,
    setModuleQuiz,

    // exams
    setFinalQuiz,

    // pricing
    setAccessType,
    setPurchasePrice,
    addSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,

    // saving
    submitCourse,
    saveAggregate,
    setStatus,
    validateWizardStep,
    validatePricing,

    // errors / overlays
    setErrors,
    dismissError,
    retryError,
    setShowSuccess,
  };
}

export type CourseEditor = ReturnType<typeof useCourseEditor>;
