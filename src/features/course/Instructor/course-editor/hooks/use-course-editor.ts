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

  /**
   * The tail of the save chain, and the ticket number of the newest save.
   *
   * Every persisting action queues behind the previous one instead of racing it. Two
   * aggregate `PUT`s in flight at once is not a theoretical problem here: adding a module
   * and saving a lesson are two clicks apart, and whichever response landed last used to
   * win — which could be the older one, silently reverting the newer edit on screen.
   *
   * The ticket closes the other half of it. A response is only allowed to write into state
   * if no newer save has been started since it left, so a slow reply that arrives after a
   * newer one has already been applied is dropped rather than allowed to overwrite it.
   */
  const saveChainRef = useRef<Promise<unknown>>(Promise.resolve());
  const saveTicketRef = useRef(0);

  /**
   * The reorder in flight *per ordered scope*, and the ticket of the newest drag in each.
   *
   * Keyed rather than single. A course orders three different things — its modules, a flat
   * course's root lessons, and the lessons inside each module — and one shared controller
   * meant dragging a lesson in module B aborted an unrelated reorder still in flight for
   * module A, discarding a drag the instructor had already been shown as applied. The key
   * is the scope itself (`modules`, `flat-lessons`, `module-lessons:<moduleId>`), so a
   * newer drag only ever supersedes an older drag of the same siblings.
   *
   * Superseding within a scope is still right: an older order of the same list is not
   * merely stale, it is wrong, and letting it finish means racing its response against the
   * newer one.
   */
  const reorderScopesRef = useRef(
    new Map<string, { controller: AbortController | null; ticket: number }>(),
  );

  const reorderScope = useCallback((key: string) => {
    const scopes = reorderScopesRef.current;
    let scope = scopes.get(key);
    if (!scope) {
      scope = { controller: null, ticket: 0 };
      scopes.set(key, scope);
    }
    return scope;
  }, []);

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
    (next: CourseEditorState): Promise<boolean> => {
      const ticket = ++saveTicketRef.current;

      const run = async (): Promise<boolean> => {
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

          // A newer save has been started while this one was in flight, and it was built
          // on top of this state. Its response is the current truth; applying this older
          // one on top would undo whatever the instructor did in between.
          if (ticket !== saveTicketRef.current) return true;

          writeState(withEditorKeys(payload, saved));
          setIsDirty(false);
          return true;
        } catch (err) {
          reportError(err, () => void persist(next));
          return false;
        } finally {
          if (ticket === saveTicketRef.current) setIsSaving(false);
        }
      };

      // Queued rather than fired: the whole course travels in each request, so two of them
      // overlapping means the server applies them in an order nobody chose.
      const queued = saveChainRef.current.then(run, run);
      saveChainRef.current = queued.catch(() => undefined);
      return queued;
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

  // The drag itself only moves the local list. Committing it is `commitLessonOrder`,
  // declared with the other two order commands once `commitOrder` exists.

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

  /**
   * Persists the order a drag ended on — the ids, and nothing else.
   *
   * ### Why not the aggregate save
   * Sending the whole course to move one lesson means a drag also re-submits every title,
   * quiz and price the tab happens to be holding, so reordering in one tab silently
   * reverts a rename made in another. This carries the ordered ids and the backend derives
   * the positions.
   *
   * ### One path, three scopes
   * Modules, root lessons and a module's lessons are the same operation on three different
   * sibling collections, and they go through this one function on purpose. The bug it
   * replaces was a nested lesson drag wired to the *module* order commit — a mistake that
   * is only possible while "commit a reorder" means three separately written things. Here
   * the caller names its scope and passes a request; it cannot pick the wrong endpoint
   * without also naming the wrong scope.
   *
   * ### Rapid drags
   * The local order is already applied — that is what the instructor is looking at — so
   * this is optimistic by construction. A drag that starts while a previous request for
   * *the same scope* is still open aborts it. Other scopes are untouched.
   *
   * ### When it fails
   * A rejected reorder (a stale list, an id the course no longer has) and a lost response
   * look identical from here, and guessing wrong in either direction leaves the screen
   * disagreeing with the database. So neither is guessed at: the course is re-read from
   * the server, which is the only thing that actually knows whether the write landed.
   */
  const commitOrder = useCallback(
    (
      scopeKey: string,
      ids: (number | null)[],
      send: (courseId: number, ids: number[], signal: AbortSignal) => Promise<CourseEditorState>,
    ) => {
      if (courseId === null) return;

      // An entity the instructor added but has not saved yet has no id, so there is no
      // order for the server to store. The pending aggregate save writes the whole list,
      // which puts this same arrangement in place.
      if (ids.some((id) => id === null)) return;

      const scope = reorderScope(scopeKey);
      const ticket = ++scope.ticket;
      // Anything still open for this scope is carrying an order the instructor has already
      // moved on from.
      scope.controller?.abort();

      const run = async () => {
        // Superseded while it sat in the queue: a newer drag of these same siblings is
        // about to send the order this one would have been overwritten by anyway.
        if (ticket !== scope.ticket) return;

        const controller = new AbortController();
        scope.controller = controller;
        setIsSaving(true);
        try {
          const saved = await send(courseId, ids as number[], controller.signal);
          if (controller.signal.aborted) return;
          writeState(withEditorKeys(stateRef.current, saved));
        } catch (err) {
          if (controller.signal.aborted) return;
          // Deliberately not a local rollback. A rejected reorder and a lost response look
          // identical from here, and guessing wrong in either direction leaves the screen
          // disagreeing with the database — so the authoritative order is fetched instead.
          reportError(err, () => void loadCourse());
          await loadCourse();
        } finally {
          if (scope.controller === controller) {
            scope.controller = null;
            setIsSaving(false);
          }
        }
      };

      // On the same queue as the aggregate saves, not beside it. A reorder overlapping a
      // course save is the one interleaving that actually loses data: the save carries the
      // list the tab held before the drag, so whichever finished second decided the stored
      // order — and half the time that was the pre-drag one. Scoping the *abort* per scope
      // and keeping the *queue* shared is deliberate: two scopes may both have a drag in
      // flight, but they still reach the server one at a time.
      const queued = saveChainRef.current.then(run, run);
      saveChainRef.current = queued.catch(() => undefined);
    },
    [courseId, loadCourse, reorderScope, reportError, writeState],
  );

  /** Persists the module order. Never called for a lesson drag. */
  const commitModuleOrder = useCallback(
    () =>
      commitOrder(
        "modules",
        stateRef.current.modules.map((module) => module.id),
        (id, ids, signal) => courseEditorService.reorderModules(id, ids, signal),
      ),
    [commitOrder],
  );

  /** Persists the root lesson order of a flat course. Never touches module order. */
  const commitLessonOrder = useCallback(
    () =>
      commitOrder(
        "flat-lessons",
        stateRef.current.lessons.map((lesson) => lesson.id),
        (id, ids, signal) => courseEditorService.reorderLessons(id, ids, signal),
      ),
    [commitOrder],
  );

  /**
   * Persists the lesson order inside one module.
   *
   * Takes the module's key because that is the only thing that survives a drag: the module
   * may be one the instructor just added, and the caller has no id for it. The key is
   * resolved to an id here, and a module without one yet is left to the pending aggregate
   * save — the same rule every other scope follows.
   *
   * The scope key includes the module id, so dragging in one module cannot abort a reorder
   * still in flight for another.
   */
  const commitModuleLessonOrder = useCallback(
    (moduleKey: string) => {
      const module = stateRef.current.modules.find((m) => m.key === moduleKey);
      if (!module || module.id === null) return;
      const moduleId = module.id;

      commitOrder(
        `module-lessons:${moduleId}`,
        module.lessons.map((lesson) => lesson.id),
        (id, ids, signal) =>
          courseEditorService.reorderModuleLessons(id, moduleId, ids, signal),
      );
    },
    [commitOrder],
  );

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
   * The course editor's publish / unpublish CTA.
   *
   * Its own request, not a course save with a different `status` in it. Two things follow
   * from that: an ordinary edit can no longer change publication as a side effect, and
   * this cannot overwrite the course with whatever this tab happens to be holding —
   * publishing a course does not re-submit its content.
   *
   * Queued behind any save already in flight, so publishing straight after an edit
   * publishes the edited course rather than racing it.
   */
  const setStatus = useCallback(
    (status: CourseStatus): Promise<boolean> => {
      // Resolved the same way a save resolves it, rather than from the editor's mode: the
      // wizard has no `courseId` but does have a course as soon as its first submit lands,
      // and publishing that course is a lifecycle call like any other.
      const targetId = courseId ?? stateRef.current.id;

      if (targetId === null) {
        // Nothing to publish separately yet — the create carries the status.
        return persist({ ...stateRef.current, status });
      }

      const run = async (): Promise<boolean> => {
        setIsSaving(true);
        try {
          const saved =
            status === "PUBLISHED"
              ? await courseEditorService.publishCourse(targetId)
              : await courseEditorService.unpublishCourse(targetId);
          writeState(withEditorKeys(stateRef.current, saved));
          return true;
        } catch (err) {
          reportError(err, () => void setStatus(status));
          return false;
        } finally {
          setIsSaving(false);
        }
      };

      const queued = saveChainRef.current.then(run, run);
      saveChainRef.current = queued.catch(() => undefined);
      return queued;
    },
    [courseId, persist, reportError, writeState],
  );

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

      // Both read before the save, because the save changes both: `persist` fills in the id
      // it comes back with, and it replaces the state with the server's answer.
      const alreadyCreated = (courseId ?? stateRef.current.id) !== null;
      const statusBefore = stateRef.current.status;

      const saved = await persist({ ...stateRef.current, status });
      if (!saved) return false;

      // A create carries the status. An update deliberately does not — so a wizard that
      // saved a draft first and only then pressed publish has to say so through the
      // lifecycle call, or the course would quietly stay a draft.
      if (alreadyCreated && statusBefore !== status && !(await setStatus(status))) {
        return false;
      }

      setShowSuccess(true);
      return true;
    },
    [
      courseId,
      persist,
      purchasePriceInput,
      setStatus,
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
    commitModuleLessonOrder,
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
