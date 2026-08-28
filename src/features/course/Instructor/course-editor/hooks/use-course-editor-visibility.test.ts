import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CourseEditorState } from "@/shared/courses";
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

function courseState(overrides: Partial<CourseEditorState> = {}): CourseEditorState {
  return {
    id: 7,
    title: "دورة منشورة",
    subtitle: "",
    description: "وصف",
    image: "",
    duration: 0,
    structure: "FLAT",
    lessons: [],
    modules: [],
    finalQuiz: null,
    accessType: "FREE",
    purchasePrice: null,
    subscriptionPlans: [],
    status: "PUBLISHED",
    visibility: "PUBLIC",
    hasUpdatesSincePublish: false,
    revision: 4,
    ...overrides,
  };
}

async function loadedEditor(state: CourseEditorState = courseState()) {
  service.loadCourse.mockResolvedValue(state);
  // The server answers with the saved course at its new revision, which is what the editor
  // adopts — the same contract every other save in this hook is held to.
  service.updateCourse.mockImplementation(async (_id, next) => ({
    ...next,
    revision: (next.revision ?? 0) + 1,
  }));
  const hook = renderHook(() => useCourseEditor({ type: "EDIT", courseId: "7" }));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/**
 * The editor's visibility control, and the two things it must not do.
 *
 * It must not leave the change sitting unsaved — an instructor who turns a course private,
 * watches the control move and closes the tab has to find it actually private, because the
 * gap between "the UI says private" and "the server says private" is exactly the window in
 * which a stranger can still enrol.
 *
 * And it must not touch publication. Publishing has its own endpoints for a reason, and a
 * course going private is not a course being withdrawn — the two states are independent, and
 * a control that quietly did both would make "published and private" unreachable.
 */
describe("the editor's visibility setting", () => {
  it("persists the change straight away, through the ordinary aggregate save", async () => {
    const hook = await loadedEditor();

    await act(async () => {
      hook.result.current.setVisibility("PRIVATE");
    });

    await waitFor(() => expect(service.updateCourse).toHaveBeenCalledTimes(1));
    const [courseId, saved] = service.updateCourse.mock.calls[0];
    expect(courseId).toBe(7);
    expect(saved.visibility).toBe("PRIVATE");
    expect(hook.result.current.state.visibility).toBe("PRIVATE");
  });

  /*
    The save carries the publication state the course already had, and goes through the
    aggregate `PUT`, which drops `status` on the wire — so making a course private cannot
    withdraw it. What must never happen here is the editor reaching for a lifecycle call.
  */
  it("does not publish or unpublish; the course stays exactly as published as it was", async () => {
    const hook = await loadedEditor();

    await act(async () => {
      hook.result.current.setVisibility("PRIVATE");
    });

    await waitFor(() => expect(service.updateCourse).toHaveBeenCalledTimes(1));
    expect(service.publishCourse).not.toHaveBeenCalled();
    expect(service.unpublishCourse).not.toHaveBeenCalled();
    expect(service.updateCourse.mock.calls[0][1].status).toBe("PUBLISHED");
    expect(hook.result.current.state.status).toBe("PUBLISHED");
  });

  it("saves at the revision it was loaded at, so a stale tab is refused by the server", async () => {
    const hook = await loadedEditor(courseState({ revision: 11 }));

    await act(async () => {
      hook.result.current.setVisibility("PRIVATE");
    });

    await waitFor(() => expect(service.updateCourse).toHaveBeenCalledTimes(1));
    expect(service.updateCourse.mock.calls[0][1].revision).toBe(11);
  });

  it("puts a private course back on the catalogue without republishing it", async () => {
    const hook = await loadedEditor(courseState({ visibility: "PRIVATE" }));

    await act(async () => {
      hook.result.current.setVisibility("PUBLIC");
    });

    await waitFor(() => expect(service.updateCourse).toHaveBeenCalledTimes(1));
    expect(service.publishCourse).not.toHaveBeenCalled();
    expect(service.updateCourse.mock.calls[0][1].visibility).toBe("PUBLIC");
  });
});
