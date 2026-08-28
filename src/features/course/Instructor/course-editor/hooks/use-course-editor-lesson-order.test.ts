import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CourseEditorState,
  CourseLessonEditorState,
  CourseModuleEditorState,
} from "@/shared/courses";
import { useCourseEditor } from "./use-course-editor";
import { courseEditorService } from "../services/course-editor.service";

vi.mock("../services/course-editor.service", () => ({
  courseEditorService: {
    loadCourse: vi.fn(),
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    publishCourse: vi.fn(),
    unpublishCourse: vi.fn(),
    reorderModules: vi.fn(),
    reorderLessons: vi.fn(),
    reorderModuleLessons: vi.fn(),
    uploadCourseImage: vi.fn(),
  },
}));

const service = vi.mocked(courseEditorService);

function lessonState(id: number, title: string): CourseLessonEditorState {
  return {
    key: `l${id}`,
    id,
    title,
    summary: "",
    description: "",
    videoUrl: "https://youtu.be/x",
    videoThumbnailUrl: null,
    quiz: null,
  };
}

function moduleState(
  id: number,
  title: string,
  lessons: CourseLessonEditorState[],
): CourseModuleEditorState {
  return { key: `m${id}`, id, title, description: "", lessons, quiz: null };
}

function courseState(
  structure: "FLAT" | "MODULES",
  lessons: CourseLessonEditorState[],
  modules: CourseModuleEditorState[],
): CourseEditorState {
  return {
    id: 7,
    title: "دورة منشورة",
    subtitle: "",
    description: "وصف",
    image: "",
    duration: 0,
    structure,
    lessons,
    modules,
    finalQuiz: null,
    accessType: "FREE",
    purchasePrice: null,
    subscriptionPlans: [],
    status: "PUBLISHED",
    hasUpdatesSincePublish: false,
    revision: 4,
  };
}

const L1 = lessonState(11, "Alpha");
const L2 = lessonState(12, "Beta");
const L3 = lessonState(13, "Gamma");

const A1 = lessonState(21, "A1");
const A2 = lessonState(22, "A2");
const B1 = lessonState(31, "B1");
const B2 = lessonState(32, "B2");

const flatCourse = () => courseState("FLAT", [L1, L2, L3], []);
const modularCourse = () =>
  courseState("MODULES", [], [moduleState(1, "First", [A1, A2]), moduleState(2, "Second", [B1, B2])]);

async function loadedEditor(state: CourseEditorState) {
  service.loadCourse.mockResolvedValue(state);
  const hook = renderHook(() => useCourseEditor({ type: "EDIT", courseId: "7" }));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/**
 * A course orders three separate things, and each drag must reach exactly one of them.
 *
 * The bug these cover was a nested lesson drag wired to the module-order commit: the
 * lesson order was never persisted, and when the module count differed from the lesson
 * count the drag failed outright. So every test here asserts twice over — the right call
 * went out, *and* the other two scopes were left alone.
 */
describe("committing a root lesson order", () => {
  it("sends the ordered lesson ids to the lesson endpoint, and only those", async () => {
    const { result } = await loadedEditor(flatCourse());
    service.reorderLessons.mockResolvedValue(courseState("FLAT", [L3, L1, L2], []));

    act(() => result.current.reorderLessons([L3, L1, L2]));
    await act(async () => {
      result.current.commitLessonOrder();
    });

    await waitFor(() => expect(service.reorderLessons).toHaveBeenCalledTimes(1));
    expect(service.reorderLessons).toHaveBeenCalledWith(7, [13, 11, 12], expect.any(AbortSignal));

    // Not the module endpoint, and — the part that used to be wrong — not the whole course.
    expect(service.reorderModules).not.toHaveBeenCalled();
    expect(service.reorderModuleLessons).not.toHaveBeenCalled();
    expect(service.updateCourse).not.toHaveBeenCalled();
  });

  it("does not touch the network while the drag is still moving", async () => {
    const { result } = await loadedEditor(flatCourse());

    act(() => result.current.reorderLessons([L2, L1, L3]));

    expect(service.reorderLessons).not.toHaveBeenCalled();
    expect(service.updateCourse).not.toHaveBeenCalled();
    // The instructor sees the new order immediately; only the drop persists it.
    expect(result.current.state.lessons.map((l) => l.id)).toEqual([12, 11, 13]);
  });

  it("adopts the order the server confirms rather than keeping its optimistic one", async () => {
    const { result } = await loadedEditor(flatCourse());
    // The server is the authority: it answers with a different arrangement than was sent.
    service.reorderLessons.mockResolvedValue(courseState("FLAT", [L1, L2, L3], []));

    act(() => result.current.reorderLessons([L3, L2, L1]));
    await act(async () => {
      result.current.commitLessonOrder();
    });

    await waitFor(() => expect(service.reorderLessons).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.state.lessons.map((l) => l.id)).toEqual([11, 12, 13]));
  });

  it("re-reads the course when the reorder fails, rather than guessing whether it landed", async () => {
    const { result } = await loadedEditor(flatCourse());
    service.reorderLessons.mockRejectedValue(new Error("rejected"));
    service.loadCourse.mockResolvedValue(courseState("FLAT", [L1, L2, L3], []));

    act(() => result.current.reorderLessons([L3, L2, L1]));
    await act(async () => {
      result.current.commitLessonOrder();
    });

    // Twice: the initial hydration, then the canonical re-read after the failure.
    await waitFor(() => expect(service.loadCourse).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.state.lessons.map((l) => l.id)).toEqual([11, 12, 13]));
    expect(result.current.errorMessage).not.toBeNull();
  });

  it("stays local while a lesson has no id yet, since there is no order to store", async () => {
    const unsaved: CourseLessonEditorState = { ...lessonState(0, "Unsaved"), id: null, key: "new" };
    const { result } = await loadedEditor(courseState("FLAT", [L1, unsaved], []));

    act(() => result.current.reorderLessons([unsaved, L1]));
    await act(async () => {
      result.current.commitLessonOrder();
    });

    expect(service.reorderLessons).not.toHaveBeenCalled();
  });
});

describe("committing a nested lesson order", () => {
  it("sends the module's lesson ids to the nested endpoint, scoped to that module", async () => {
    const { result } = await loadedEditor(modularCourse());
    service.reorderModuleLessons.mockResolvedValue(modularCourse());

    act(() => result.current.reorderModuleLessons("m1", [A2, A1]));
    await act(async () => {
      result.current.commitModuleLessonOrder("m1");
    });

    await waitFor(() => expect(service.reorderModuleLessons).toHaveBeenCalledTimes(1));
    expect(service.reorderModuleLessons).toHaveBeenCalledWith(
      7,
      1,
      [22, 21],
      expect.any(AbortSignal),
    );
  });

  it("never calls the module-order endpoint — the defect this replaces", async () => {
    const { result } = await loadedEditor(modularCourse());
    service.reorderModuleLessons.mockResolvedValue(modularCourse());

    act(() => result.current.reorderModuleLessons("m1", [A2, A1]));
    await act(async () => {
      result.current.commitModuleLessonOrder("m1");
    });

    await waitFor(() => expect(service.reorderModuleLessons).toHaveBeenCalledTimes(1));
    expect(service.reorderModules).not.toHaveBeenCalled();
    expect(service.reorderLessons).not.toHaveBeenCalled();
    expect(service.updateCourse).not.toHaveBeenCalled();
  });

  it("changes only the dragged module's lessons locally", async () => {
    const { result } = await loadedEditor(modularCourse());

    act(() => result.current.reorderModuleLessons("m1", [A2, A1]));

    expect(result.current.state.modules[0].lessons.map((l) => l.id)).toEqual([22, 21]);
    expect(result.current.state.modules[1].lessons.map((l) => l.id)).toEqual([31, 32]);
    expect(service.reorderModuleLessons).not.toHaveBeenCalled();
  });

  it("addresses the second module by its own id, not the first one's", async () => {
    const { result } = await loadedEditor(modularCourse());
    service.reorderModuleLessons.mockResolvedValue(modularCourse());

    act(() => result.current.reorderModuleLessons("m2", [B2, B1]));
    await act(async () => {
      result.current.commitModuleLessonOrder("m2");
    });

    await waitFor(() => expect(service.reorderModuleLessons).toHaveBeenCalledTimes(1));
    expect(service.reorderModuleLessons).toHaveBeenCalledWith(
      7,
      2,
      [32, 31],
      expect.any(AbortSignal),
    );
  });

  it("does not abort a reorder still in flight for a different module", async () => {
    const { result } = await loadedEditor(modularCourse());

    // The first module's reorder is left hanging; the second module's lands immediately.
    const signals: AbortSignal[] = [];
    let releaseFirst: (() => void) | null = null;
    service.reorderModuleLessons.mockImplementation(
      (_courseId: number, moduleId: number, _ids: number[], signal?: AbortSignal) => {
        if (signal) signals.push(signal);
        if (moduleId === 1) {
          return new Promise<CourseEditorState>((resolve) => {
            releaseFirst = () => resolve(modularCourse());
          });
        }
        return Promise.resolve(modularCourse());
      },
    );

    act(() => result.current.reorderModuleLessons("m1", [A2, A1]));
    act(() => {
      result.current.commitModuleLessonOrder("m1");
    });
    await waitFor(() => expect(service.reorderModuleLessons).toHaveBeenCalledTimes(1));

    act(() => result.current.reorderModuleLessons("m2", [B2, B1]));
    act(() => {
      result.current.commitModuleLessonOrder("m2");
    });

    // One shared abort controller used to make this cancel module 1's request — discarding
    // a drag the instructor had already been shown as applied.
    expect(signals[0].aborted).toBe(false);

    await act(async () => {
      releaseFirst?.();
    });
    await waitFor(() => expect(service.reorderModuleLessons).toHaveBeenCalledTimes(2));
  });

  it("supersedes an earlier drag of the same module", async () => {
    const { result } = await loadedEditor(modularCourse());

    const signals: AbortSignal[] = [];
    service.reorderModuleLessons.mockImplementation(
      (_courseId: number, _moduleId: number, _ids: number[], signal?: AbortSignal) => {
        if (signal) signals.push(signal);
        return new Promise<CourseEditorState>(() => {});
      },
    );

    act(() => result.current.reorderModuleLessons("m1", [A2, A1]));
    act(() => {
      result.current.commitModuleLessonOrder("m1");
    });
    await waitFor(() => expect(signals).toHaveLength(1));

    act(() => result.current.reorderModuleLessons("m1", [A1, A2]));
    act(() => {
      result.current.commitModuleLessonOrder("m1");
    });

    // The older order of the same siblings is not merely stale, it is wrong.
    await waitFor(() => expect(signals[0].aborted).toBe(true));
  });

  it("re-reads the course when a nested reorder fails", async () => {
    const { result } = await loadedEditor(modularCourse());
    service.reorderModuleLessons.mockRejectedValue(new Error("rejected"));
    service.loadCourse.mockResolvedValue(modularCourse());

    act(() => result.current.reorderModuleLessons("m1", [A2, A1]));
    await act(async () => {
      result.current.commitModuleLessonOrder("m1");
    });

    await waitFor(() => expect(service.loadCourse).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(result.current.state.modules[0].lessons.map((l) => l.id)).toEqual([21, 22]),
    );
    expect(result.current.errorMessage).not.toBeNull();
  });

  it("stays local while the module has no id yet", async () => {
    const unsavedModule: CourseModuleEditorState = {
      ...moduleState(0, "Unsaved", [A1, A2]),
      id: null,
      key: "mnew",
    };
    const { result } = await loadedEditor(courseState("MODULES", [], [unsavedModule]));

    act(() => result.current.reorderModuleLessons("mnew", [A2, A1]));
    await act(async () => {
      result.current.commitModuleLessonOrder("mnew");
    });

    expect(service.reorderModuleLessons).not.toHaveBeenCalled();
    expect(service.reorderModules).not.toHaveBeenCalled();
  });

  it("stays local while one of the module's lessons has no id yet", async () => {
    const unsaved: CourseLessonEditorState = { ...lessonState(0, "Unsaved"), id: null, key: "new" };
    const { result } = await loadedEditor(
      courseState("MODULES", [], [moduleState(1, "First", [A1, unsaved])]),
    );

    act(() => result.current.reorderModuleLessons("m1", [unsaved, A1]));
    await act(async () => {
      result.current.commitModuleLessonOrder("m1");
    });

    expect(service.reorderModuleLessons).not.toHaveBeenCalled();
  });
});
