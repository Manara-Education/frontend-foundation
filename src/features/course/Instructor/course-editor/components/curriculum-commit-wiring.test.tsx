import type { ComponentProps } from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CourseEditorTabs } from "@/features/lesson/instructor/add-lessons/components/course-editor-tabs";
import { CourseEditorWizard } from "@/features/course/Instructor/create-course/components/course-editor-wizard";
import { createEmptyCourseEditorState } from "@/shared/courses";

/**
 * Which editor method each curriculum callback is actually wired to.
 *
 * The defect was here and nowhere else: `onReorderModuleLessonsCommit` was handed
 * `editor.commitModuleOrder`, so dragging a lesson inside a module persisted a *module*
 * order — the lesson order was never written, and when the module count differed from the
 * lesson count the request was rejected outright.
 *
 * TypeScript cannot catch it. A `() => void` is assignable wherever a
 * `(moduleKey: string) => void` is expected, so the wrong callback type-checks perfectly.
 * The only thing that catches it is asserting, at the seam, which method runs.
 *
 * The curriculum section is stubbed rather than driven: what is under test is the wiring
 * between the editor hook and the section, not the section's own drag handling, which
 * `module-curriculum-section.test.tsx` covers.
 *
 * Both surfaces that mount the section are checked, because both had the same mistake and
 * fixing one would not have fixed the other.
 */
const captured: {
  onReorderModulesCommit?: () => void;
  onReorderModuleLessonsCommit?: (moduleKey: string) => void;
  onReorderModules?: (modules: unknown[]) => void;
  onReorderModuleLessons?: (moduleKey: string, lessons: unknown[]) => void;
  onReorderCommit?: () => void;
  onReorder?: (lessons: unknown[]) => void;
} = {};

vi.mock(
  "./module-curriculum-section",
  () => ({
    ModuleCurriculumSection: (props: Record<string, unknown>) => {
      Object.assign(captured, props);
      return null;
    },
  }),
);

vi.mock("./flat-curriculum-section", () => ({
  FlatCurriculumSection: (props: Record<string, unknown>) => {
    Object.assign(captured, props);
    return null;
  },
}));

function stubEditor(structure: "FLAT" | "MODULES" = "MODULES") {
  return {
    state: { ...createEmptyCourseEditorState(), structure },
    totalLessons: 0,
    imagePreview: null,
    purchasePriceInput: "",
    isLoading: false,
    isSaving: false,
    isDirty: false,
    errors: {},
    errorMessage: null,
    showSuccess: false,

    commitModuleOrder: vi.fn(),
    commitModuleLessonOrder: vi.fn(),
    commitLessonOrder: vi.fn(),
    reorderModules: vi.fn(),
    reorderModuleLessons: vi.fn(),
    reorderLessons: vi.fn(),

    addModule: vi.fn(() => "new"),
    updateModule: vi.fn(),
    deleteModule: vi.fn(),
    setModuleQuiz: vi.fn(),
    setModuleLessonQuiz: vi.fn(),
    setLessonQuiz: vi.fn(),
    addLesson: vi.fn(),
    updateLesson: vi.fn(),
    deleteLesson: vi.fn(),
    addModuleLesson: vi.fn(),
    updateModuleLesson: vi.fn(),
    deleteModuleLesson: vi.fn(),
    setTitle: vi.fn(),
    setDescription: vi.fn(),
    setImage: vi.fn(),
    clearImage: vi.fn(),
    setStructure: vi.fn(),
    setFinalQuiz: vi.fn(),
    setAccessType: vi.fn(),
    setPurchasePrice: vi.fn(),
    addSubscriptionPlan: vi.fn(),
    updateSubscriptionPlan: vi.fn(),
    deleteSubscriptionPlan: vi.fn(),
    setErrors: vi.fn(),
    dismissError: vi.fn(),
    retryError: vi.fn(),
    setShowSuccess: vi.fn(),
    submitCourse: vi.fn(),
    saveAggregate: vi.fn(),
    setStatus: vi.fn(),
    validateWizardStep: vi.fn(),
    validatePricing: vi.fn(),
  };
}

function renderTabs(structure: "FLAT" | "MODULES" = "MODULES") {
  const editor = stubEditor(structure);
  const controller = {
    editor,
    activeTab: "content" as const,
    setActiveTab: vi.fn(),
    lessonFormOpen: false,
    lessonEditKey: null,
    publishError: null,
    pricingError: null,
    infoSaved: false,
    setInfoSaved: vi.fn(),
    openAddLesson: vi.fn(),
    openEditLesson: vi.fn(),
    closeLessonForm: vi.fn(),
    saveLesson: vi.fn(),
    saveModuleLesson: vi.fn(),
    deleteLesson: vi.fn(),
    saveOverview: vi.fn(),
    savePricing: vi.fn(),
    setAccessType: vi.fn(),
    setPurchasePrice: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
    onFinish: vi.fn(),
  };

  // The controller is a hook's return value; the stub matches it structurally, and the
  // cast is confined to this one line rather than weakening the component's own types.
  render(<CourseEditorTabs {...(controller as unknown as ComponentProps<typeof CourseEditorTabs>)} />);
  return editor;
}

beforeEach(() => {
  vi.clearAllMocks();
  for (const key of Object.keys(captured)) delete (captured as Record<string, unknown>)[key];
});

describe("the course editor's curriculum wiring", () => {
  it("commits a nested lesson drag through the nested lesson order command", () => {
    const editor = renderTabs();

    captured.onReorderModuleLessonsCommit?.("m1");

    expect(editor.commitModuleLessonOrder).toHaveBeenCalledWith("m1");
    // The regression, stated directly.
    expect(editor.commitModuleOrder).not.toHaveBeenCalled();
  });

  it("commits a module drag through the module order command", () => {
    const editor = renderTabs();

    captured.onReorderModulesCommit?.();

    expect(editor.commitModuleOrder).toHaveBeenCalledTimes(1);
    expect(editor.commitModuleLessonOrder).not.toHaveBeenCalled();
  });

  it("keeps the two drag handlers apart as well as the two commits", () => {
    const editor = renderTabs();

    captured.onReorderModules?.([]);
    expect(editor.reorderModules).toHaveBeenCalledTimes(1);
    expect(editor.reorderModuleLessons).not.toHaveBeenCalled();

    captured.onReorderModuleLessons?.("m1", []);
    expect(editor.reorderModuleLessons).toHaveBeenCalledWith("m1", []);
    expect(editor.reorderModules).toHaveBeenCalledTimes(1);
  });
});

function renderWizard() {
  const editor = stubEditor();
  const controller = {
    editor,
    step: 3,
    lessonFormOpen: false,
    lessonEditKey: null,
    goNext: vi.fn(),
    goPrev: vi.fn(),
    goToStep: vi.fn(),
    openAddLesson: vi.fn(),
    openEditLesson: vi.fn(),
    closeLessonForm: vi.fn(),
    saveLesson: vi.fn(),
    saveModuleLesson: vi.fn(),
    handleCancel: vi.fn(),
    handleSuccessClose: vi.fn(),
    publish: vi.fn(),
    saveDraft: vi.fn(),
  };

  render(
    <CourseEditorWizard
      {...(controller as unknown as ComponentProps<typeof CourseEditorWizard>)}
    />,
  );
  return editor;
}

describe("the create wizard's curriculum wiring", () => {
  it("commits a nested lesson drag through the nested lesson order command", () => {
    const editor = renderWizard();

    captured.onReorderModuleLessonsCommit?.("m1");

    expect(editor.commitModuleLessonOrder).toHaveBeenCalledWith("m1");
    expect(editor.commitModuleOrder).not.toHaveBeenCalled();
  });

  it("commits a module drag through the module order command", () => {
    const editor = renderWizard();

    captured.onReorderModulesCommit?.();

    expect(editor.commitModuleOrder).toHaveBeenCalledTimes(1);
    expect(editor.commitModuleLessonOrder).not.toHaveBeenCalled();
  });
});

/**
 * The flat curriculum's own scope.
 *
 * It was never mis-wired the way the nested one was, but it was persisted the wrong way:
 * committing a root lesson drag re-sent the entire course aggregate, so a drag carried
 * back every title, quiz and price the tab happened to be holding — and undid whatever had
 * changed elsewhere since it loaded.
 */
describe("the flat curriculum's wiring", () => {
  it("commits a root lesson drag through the root lesson order command", () => {
    const editor = renderTabs("FLAT");

    captured.onReorderCommit?.();

    expect(editor.commitLessonOrder).toHaveBeenCalledTimes(1);
    expect(editor.commitModuleOrder).not.toHaveBeenCalled();
    expect(editor.commitModuleLessonOrder).not.toHaveBeenCalled();
    // And not the aggregate save, which is how this used to reach the server.
    expect(editor.saveAggregate).not.toHaveBeenCalled();
  });

  it("keeps the drag itself local", () => {
    const editor = renderTabs("FLAT");

    captured.onReorder?.([]);

    expect(editor.reorderLessons).toHaveBeenCalledTimes(1);
    expect(editor.commitLessonOrder).not.toHaveBeenCalled();
  });
});
