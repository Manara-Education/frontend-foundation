import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CourseEditorState, CourseModuleEditorState } from "@/shared/courses";
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

function moduleState(id: number, title: string): CourseModuleEditorState {
  return { key: `m${id}`, id, title, description: "", lessons: [], quiz: null };
}

function courseState(modules: CourseModuleEditorState[]): CourseEditorState {
  return {
    id: 7,
    title: "دورة منشورة",
    subtitle: "",
    description: "وصف",
    image: "",
    duration: 0,
    structure: "MODULES",
    lessons: [],
    modules,
    finalQuiz: null,
    accessType: "FREE",
    purchasePrice: null,
    subscriptionPlans: [],
    status: "PUBLISHED",
    visibility: "PUBLIC",
    hasUpdatesSincePublish: false,
    revision: 4,
  };
}

const A = moduleState(1, "Introduction");
const B = moduleState(2, "Basics");
const C = moduleState(3, "Advanced");

async function loadedEditor(modules = [A, B, C]) {
  service.loadCourse.mockResolvedValue(courseState(modules));
  const hook = renderHook(() => useCourseEditor({ type: "EDIT", courseId: "7" }));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/**
 * The behaviour the reorder bug was hiding in. Dragging a module used to change the local
 * list and nothing else — no request was ever sent — so the new order was correct on
 * screen and gone on the next load.
 */
describe("committing a module order", () => {
  it("sends the ordered module ids, and only those", async () => {
    const { result } = await loadedEditor();
    service.reorderModules.mockResolvedValue(courseState([C, A, B]));

    act(() => result.current.reorderModules([C, A, B]));
    await act(async () => {
      result.current.commitModuleOrder();
    });

    await waitFor(() => expect(service.reorderModules).toHaveBeenCalledTimes(1));
    expect(service.reorderModules).toHaveBeenCalledWith(7, [3, 1, 2], expect.any(AbortSignal));
    expect(service.updateCourse).not.toHaveBeenCalled();
    // A module drag is a module drag. Neither lesson scope is involved.
    expect(service.reorderLessons).not.toHaveBeenCalled();
    expect(service.reorderModuleLessons).not.toHaveBeenCalled();
  });

  it("does not touch the network while the drag is still moving", async () => {
    const { result } = await loadedEditor();

    act(() => result.current.reorderModules([B, A, C]));
    act(() => result.current.reorderModules([B, C, A]));
    act(() => result.current.reorderModules([C, B, A]));

    expect(service.reorderModules).not.toHaveBeenCalled();
    expect(service.updateCourse).not.toHaveBeenCalled();
  });

  it("adopts the order the server confirms", async () => {
    const { result } = await loadedEditor();
    service.reorderModules.mockResolvedValue(courseState([C, A, B]));

    act(() => result.current.reorderModules([C, A, B]));
    await act(async () => {
      result.current.commitModuleOrder();
    });

    await waitFor(() =>
      expect(result.current.state.modules.map((m) => m.id)).toEqual([3, 1, 2]),
    );
  });

  it("skips a reorder that a newer drag superseded before it left", async () => {
    const { result } = await loadedEditor();
    service.reorderModules.mockResolvedValue(courseState([C, A, B]));

    // Three drags in quick succession. The first two are already wrong by the time the
    // queue reaches them, so sending them would only be racing the third.
    act(() => result.current.reorderModules([B, A, C]));
    act(() => result.current.commitModuleOrder());
    act(() => result.current.reorderModules([A, C, B]));
    act(() => result.current.commitModuleOrder());
    act(() => result.current.reorderModules([C, A, B]));
    act(() => result.current.commitModuleOrder());

    await waitFor(() => expect(service.reorderModules).toHaveBeenCalledTimes(1));
    expect(service.reorderModules).toHaveBeenCalledWith(7, [3, 1, 2], expect.any(AbortSignal));
  });

  it("aborts a reorder that is already in flight when a newer drag lands", async () => {
    const { result } = await loadedEditor();
    const signals: AbortSignal[] = [];
    let releaseFirst: () => void = () => {};

    service.reorderModules.mockImplementation(async (_id, _ids, signal) => {
      signals.push(signal as AbortSignal);
      if (signals.length === 1) {
        await new Promise<void>((resolve) => {
          releaseFirst = resolve;
        });
      }
      return courseState([C, A, B]);
    });

    act(() => result.current.reorderModules([B, A, C]));
    act(() => result.current.commitModuleOrder());
    await waitFor(() => expect(service.reorderModules).toHaveBeenCalledTimes(1));

    act(() => result.current.reorderModules([C, A, B]));
    act(() => result.current.commitModuleOrder());
    expect(signals[0].aborted).toBe(true);

    await act(async () => {
      releaseFirst();
      await waitFor(() => expect(service.reorderModules).toHaveBeenCalledTimes(2));
    });

    // The order that reaches state is the one the instructor actually landed on; the
    // abandoned request's response is dropped rather than applied on top of it.
    expect(service.reorderModules).toHaveBeenLastCalledWith(7, [3, 1, 2], expect.any(AbortSignal));
    await waitFor(() => expect(result.current.state.modules.map((m) => m.id)).toEqual([3, 1, 2]));
  });

  it("re-reads the course when a reorder fails, rather than guessing whether it landed", async () => {
    const { result } = await loadedEditor();
    service.reorderModules.mockRejectedValue(new Error("network"));
    service.loadCourse.mockResolvedValue(courseState([A, B, C]));

    act(() => result.current.reorderModules([C, B, A]));
    await act(async () => {
      result.current.commitModuleOrder();
    });

    await waitFor(() => expect(result.current.errorMessage).not.toBeNull());
    // Loaded once on mount, then again to find out what the server actually holds.
    expect(service.loadCourse).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(result.current.state.modules.map((m) => m.id)).toEqual([1, 2, 3]));
  });

  it("stays local while a module has no id yet, since there is no order to store", async () => {
    const unsaved: CourseModuleEditorState = {
      key: "new",
      id: null,
      title: "Unsaved",
      description: "",
      lessons: [],
      quiz: null,
    };
    const { result } = await loadedEditor([A, unsaved]);

    act(() => result.current.reorderModules([unsaved, A]));
    act(() => result.current.commitModuleOrder());

    expect(service.reorderModules).not.toHaveBeenCalled();
  });
});

describe("the create wizard", () => {
  it("publishes a course it had already saved as a draft", async () => {
    // CREATE mode: no courseId, and the first submit is what creates the course.
    // The server echoes back what it stored, so the wizard keeps the title and description
    // the instructor typed — which the next submit is validated against.
    service.createCourse.mockImplementation(async (state) => ({ ...state, id: 7, status: "DRAFT" }));
    // Faithful to the real endpoint: an update never carries a status, so the course comes
    // back with the publication state it already had.
    service.updateCourse.mockImplementation(async (_id, state) => ({ ...state, status: "DRAFT" }));
    service.publishCourse.mockImplementation(async () => ({
      ...courseState([A]),
      title: "دورة كاملة الاسم",
      description: "وصف طويل بما يكفي ليتجاوز الحد الأدنى المطلوب",
      status: "PUBLISHED",
    visibility: "PUBLIC",
    }));

    const { result } = renderHook(() => useCourseEditor({ type: "CREATE" }));

    act(() => {
      result.current.setTitle("دورة كاملة الاسم");
      result.current.setDescription("وصف طويل بما يكفي ليتجاوز الحد الأدنى المطلوب");
    });

    await act(async () => {
      await result.current.submitCourse("DRAFT");
    });
    expect(service.createCourse).toHaveBeenCalledTimes(1);

    // The second submit updates the course that now exists — and an update carries no
    // status, so publishing has to go through the lifecycle call or be lost.
    await act(async () => {
      await result.current.submitCourse("PUBLISHED");
    });

    expect(service.publishCourse).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.state.status).toBe("PUBLISHED"));
  });
});

describe("publication is its own operation", () => {
  it("publishes through the publish endpoint, not through a course save", async () => {
    const { result } = await loadedEditor();
    service.publishCourse.mockResolvedValue({ ...courseState([A, B, C]), status: "PUBLISHED" });

    await act(async () => {
      await result.current.setStatus("PUBLISHED");
    });

    expect(service.publishCourse).toHaveBeenCalledWith(7);
    expect(service.updateCourse).not.toHaveBeenCalled();
  });

  it("unpublishes through the unpublish endpoint", async () => {
    const { result } = await loadedEditor();
    service.unpublishCourse.mockResolvedValue({ ...courseState([A, B, C]), status: "DRAFT" });

    await act(async () => {
      await result.current.setStatus("DRAFT");
    });

    expect(service.unpublishCourse).toHaveBeenCalledWith(7);
    expect(service.updateCourse).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.state.status).toBe("DRAFT"));
  });

  it("an ordinary content save keeps the course published", async () => {
    const { result } = await loadedEditor();
    service.updateCourse.mockResolvedValue(courseState([A, B, C]));

    await act(async () => {
      result.current.updateModule("m1", { title: "Introduction, renamed", description: "" });
    });

    await waitFor(() => expect(service.updateCourse).toHaveBeenCalledTimes(1));
    expect(result.current.state.status).toBe("PUBLISHED");
  });
});

/**
 * Two aggregate saves in flight at once is two clicks apart in this editor, and the loser
 * used to be whichever response happened to land last.
 */
describe("overlapping saves", () => {
  it("runs saves one after another rather than racing them", async () => {
    const { result } = await loadedEditor();
    const inFlight: string[] = [];
    let concurrent = 0;
    let peak = 0;

    service.updateCourse.mockImplementation(async (_id, state) => {
      concurrent += 1;
      peak = Math.max(peak, concurrent);
      inFlight.push(state.title);
      await new Promise((resolve) => setTimeout(resolve, 5));
      concurrent -= 1;
      return state;
    });

    await act(async () => {
      result.current.updateModule("m1", { title: "first", description: "" });
      result.current.updateModule("m2", { title: "second", description: "" });
      await new Promise((resolve) => setTimeout(resolve, 60));
    });

    expect(service.updateCourse).toHaveBeenCalledTimes(2);
    expect(peak).toBe(1);
  });

  it("does not let a slow older response overwrite a newer one", async () => {
    const { result } = await loadedEditor();
    let call = 0;

    service.updateCourse.mockImplementation(async (_id, state) => {
      call += 1;
      const mine = call;
      // The first response is deliberately the slower one.
      await new Promise((resolve) => setTimeout(resolve, mine === 1 ? 40 : 1));
      return { ...state, title: mine === 1 ? "stale" : "fresh" };
    });

    await act(async () => {
      result.current.updateModule("m1", { title: "one", description: "" });
      result.current.updateModule("m2", { title: "two", description: "" });
      await new Promise((resolve) => setTimeout(resolve, 120));
    });

    expect(result.current.state.title).toBe("fresh");
  });
});

/**
 * The other half of the course: everything that is not an order.
 *
 * Ordering has three commands of its own; every other edit still travels as the whole
 * aggregate, and this is where that is pinned down. Two things matter for each — that the
 * save went out at all, and that what came back is what the editor then holds. The second
 * is the one that quietly breaks: an editor that keeps its optimistic copy after a
 * successful save shows the instructor values the server never stored, ids included.
 */
describe("aggregate edits to a published course", () => {
  function published(overrides: Partial<CourseEditorState> = {}): CourseEditorState {
    return { ...courseState([A, B, C]), ...overrides };
  }

  async function saveAndReadBack(
    mutate: (editor: ReturnType<typeof useCourseEditor>) => void,
    serverAnswer: CourseEditorState,
  ) {
    const { result } = await loadedEditor();
    service.updateCourse.mockResolvedValue(serverAnswer);

    await act(async () => {
      mutate(result.current);
    });
    await waitFor(() => expect(service.updateCourse).toHaveBeenCalledTimes(1));
    return result;
  }

  it("saves a metadata change through the aggregate, not through an order command", async () => {
    const result = await saveAndReadBack(
      (editor) => editor.saveAggregate(),
      published({ title: "عنوان محفوظ" }),
    );

    expect(service.updateCourse).toHaveBeenCalledWith(7, expect.objectContaining({ id: 7 }));
    expect(service.reorderModules).not.toHaveBeenCalled();
    expect(service.reorderLessons).not.toHaveBeenCalled();
    expect(service.reorderModuleLessons).not.toHaveBeenCalled();
  });

  it("adopts the server's course after a save rather than keeping its own copy", async () => {
    // The server normalises: it trims the title, settles the price, and — the part that
    // matters most — assigns real ids to anything that was created.
    const result = await saveAndReadBack(
      (editor) => {
        editor.setTitle("  عنوان غير مشذب  ");
        editor.saveAggregate();
      },
      published({
        title: "عنوان مشذب",
        accessType: "PURCHASE",
        purchasePrice: 199.99,
        hasUpdatesSincePublish: true,
      }),
    );

    await waitFor(() => expect(result.current.state.title).toBe("عنوان مشذب"));
    expect(result.current.state.purchasePrice).toBe(199.99);
    expect(result.current.state.accessType).toBe("PURCHASE");
  });

  it("keeps the course published, and adopts the update flag the server derived", async () => {
    const result = await saveAndReadBack(
      (editor) => editor.saveAggregate(),
      published({ hasUpdatesSincePublish: true }),
    );

    await waitFor(() => expect(result.current.state.hasUpdatesSincePublish).toBe(true));
    expect(result.current.state.status).toBe("PUBLISHED");
    // The flag is the server's to decide; the editor never computes one of its own.
    expect(service.publishCourse).not.toHaveBeenCalled();
  });

  it("marks the editor clean once the save lands", async () => {
    const { result } = await loadedEditor();
    service.updateCourse.mockResolvedValue(published());

    act(() => result.current.setTitle("عنوان جديد"));
    expect(result.current.isDirty).toBe(true);

    await act(async () => {
      result.current.saveAggregate();
    });

    await waitFor(() => expect(result.current.isDirty).toBe(false));
  });

  it("leaves the editor dirty when the save fails, rather than looking saved", async () => {
    const { result } = await loadedEditor();
    service.updateCourse.mockRejectedValue(new Error("rejected"));

    act(() => result.current.setTitle("عنوان جديد"));
    await act(async () => {
      result.current.saveAggregate();
    });

    await waitFor(() => expect(result.current.errorMessage).not.toBeNull());
    expect(result.current.isDirty).toBe(true);
  });

  it("does not persist a keystroke", async () => {
    const { result } = await loadedEditor();

    act(() => result.current.setTitle("ع"));
    act(() => result.current.setTitle("عن"));

    expect(service.updateCourse).not.toHaveBeenCalled();
    expect(result.current.isDirty).toBe(true);
  });
});
