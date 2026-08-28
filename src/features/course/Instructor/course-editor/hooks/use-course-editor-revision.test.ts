import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiErrorCode } from "@/shared/api";
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

const A = moduleState(1, "Introduction");
const B = moduleState(2, "Basics");

function courseState(revision: number, modules: CourseModuleEditorState[] = [A, B]): CourseEditorState {
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
    revision,
  };
}

async function loadedEditor(revision = 4) {
  service.loadCourse.mockResolvedValue(courseState(revision));
  const hook = renderHook(() => useCourseEditor({ type: "EDIT", courseId: "7" }));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

function versionConflict() {
  return new ApiError(
    409,
    ["تم تعديل هذه الدورة في مكان آخر بعد فتحك لها. أعد تحميل أحدث نسخة ثم احفظ تعديلاتك"],
    ApiErrorCode.COURSE_VERSION_CONFLICT,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/**
 * The editor's half of the optimistic-concurrency contract.
 *
 * The aggregate `PUT` is a full replacement, so the server has to be told which version of the
 * course this tab built its payload from. That is one obligation with two halves: send the
 * revision the server last gave, and adopt whatever it gives back — from a save, from a reorder,
 * from a publish. An editor that kept quoting the revision it first loaded with would end up in
 * conflict with nobody but itself.
 */
describe("the revision the editor is holding", () => {
  it("is sent with every aggregate save", async () => {
    const { result } = await loadedEditor(4);
    service.updateCourse.mockResolvedValue(courseState(5));

    await act(async () => {
      await result.current.saveAggregate();
    });

    expect(service.updateCourse).toHaveBeenCalledWith(7, expect.objectContaining({ revision: 4 }));
  });

  it("becomes whatever the save answers with, so two saves in a row both land", async () => {
    const { result } = await loadedEditor(4);
    service.updateCourse.mockResolvedValueOnce(courseState(5));

    await act(async () => {
      await result.current.saveAggregate();
    });
    expect(result.current.state.revision).toBe(5);

    service.updateCourse.mockResolvedValueOnce(courseState(6));
    await act(async () => {
      await result.current.saveAggregate();
    });

    expect(service.updateCourse).toHaveBeenLastCalledWith(
      7,
      expect.objectContaining({ revision: 5 }),
    );
  });

  /**
   * A reorder is an accepted change, so it moves the revision too — and the editor has to
   * notice. This is the sequence that would otherwise make the editor conflict with itself:
   * drag a module, then save, quoting a revision its own drag had already superseded.
   */
  it("becomes whatever a reorder answers with, so a save after a drag still lands", async () => {
    const { result } = await loadedEditor(4);
    service.reorderModules.mockResolvedValue(courseState(5, [B, A]));

    act(() => result.current.reorderModules([B, A]));
    await act(async () => {
      result.current.commitModuleOrder();
    });
    await waitFor(() => expect(result.current.state.revision).toBe(5));

    service.updateCourse.mockResolvedValue(courseState(6, [B, A]));
    await act(async () => {
      await result.current.saveAggregate();
    });

    expect(service.updateCourse).toHaveBeenCalledWith(7, expect.objectContaining({ revision: 5 }));
  });
});

/**
 * What the editor does when the server refuses a save as stale.
 *
 * Three things it must not do, and they are the whole point: not re-send the payload, not
 * overwrite the newer server state with it, and not try to merge the two. A course tree is not
 * something to auto-merge — the wrong guess about which version of a nested quiz was meant is
 * silent data loss, and it would be indistinguishable from the bug this replaces.
 */
describe("when the server says the course moved on", () => {
  it("shows the server's message as a conflict rather than an ordinary error", async () => {
    const { result } = await loadedEditor();
    service.updateCourse.mockRejectedValue(versionConflict());

    await act(async () => {
      await result.current.saveAggregate();
    });

    expect(result.current.errorKind).toBe("VERSION_CONFLICT");
    expect(result.current.errorMessage).toContain("أعد تحميل أحدث نسخة");
  });

  it("does not re-send the refused payload", async () => {
    const { result } = await loadedEditor();
    service.updateCourse.mockRejectedValue(versionConflict());

    await act(async () => {
      await result.current.saveAggregate();
    });
    const savesBeforeRecovery = service.updateCourse.mock.calls.length;

    service.loadCourse.mockResolvedValue(courseState(9));
    await act(async () => {
      result.current.retryError();
    });

    await waitFor(() => expect(result.current.state.revision).toBe(9));
    expect(service.updateCourse).toHaveBeenCalledTimes(savesBeforeRecovery);
  });

  it("recovers by reloading the latest version", async () => {
    const { result } = await loadedEditor(4);
    service.updateCourse.mockRejectedValue(versionConflict());

    act(() => result.current.setTitle("عنوان من تبويب قديم"));
    await act(async () => {
      await result.current.saveAggregate();
    });

    service.loadCourse.mockResolvedValue(courseState(9));
    await act(async () => {
      result.current.retryError();
    });

    await waitFor(() => expect(service.loadCourse).toHaveBeenCalledTimes(2));
    expect(result.current.state.revision).toBe(9);
    expect(result.current.state.title).toBe("دورة منشورة");
    expect(result.current.errorMessage).toBeNull();
  });

  it("leaves the unsaved edits on screen until the instructor chooses to reload", async () => {
    const { result } = await loadedEditor();
    service.updateCourse.mockRejectedValue(versionConflict());

    act(() => result.current.setTitle("عنوان لم يُحفظ"));
    await act(async () => {
      await result.current.saveAggregate();
    });

    // Refused, not discarded: what they typed is still there to copy out of.
    expect(result.current.state.title).toBe("عنوان لم يُحفظ");
    expect(result.current.isDirty).toBe(true);
  });

  it("still treats an ordinary failure as an ordinary failure", async () => {
    const { result } = await loadedEditor();
    service.updateCourse.mockRejectedValue(new ApiError(500, ["حدث خطأ في الخادم"]));

    await act(async () => {
      await result.current.saveAggregate();
    });

    expect(result.current.errorKind).toBe("ERROR");

    // And retrying one of those really does retry it.
    service.updateCourse.mockResolvedValue(courseState(5));
    await act(async () => {
      result.current.retryError();
    });
    await waitFor(() => expect(service.updateCourse).toHaveBeenCalledTimes(2));
  });
});

/**
 * The cover image, which travels as two requests: upload the file, then attach the URL.
 *
 * The second one can fail — and when it did, the first one had already cleared the pending
 * file. So the upload was orphaned on the server *and* the cover the instructor picked was
 * quietly dropped from whatever the retry sent.
 */
describe("a cover image across a failed save", () => {
  it("uploads once and attaches the same URL on the retry", async () => {
    const { result } = await loadedEditor();
    service.uploadCourseImage.mockResolvedValue("/uploads/new-cover.png");
    service.updateCourse.mockRejectedValueOnce(new ApiError(500, ["حدث خطأ في الخادم"]));

    act(() => result.current.setImage(new File(["x"], "cover.png"), "blob:preview"));
    await act(async () => {
      await result.current.saveAggregate();
    });

    service.updateCourse.mockResolvedValue(courseState(5));
    await act(async () => {
      result.current.retryError();
    });
    await waitFor(() => expect(service.updateCourse).toHaveBeenCalledTimes(2));

    // One file on the server, not two, and the retry still carried it.
    expect(service.uploadCourseImage).toHaveBeenCalledTimes(1);
    expect(service.updateCourse).toHaveBeenLastCalledWith(
      7,
      expect.objectContaining({ image: "/uploads/new-cover.png" }),
    );
  });

  it("keeps the picked file pending while the save is failing", async () => {
    const { result } = await loadedEditor();
    service.uploadCourseImage.mockResolvedValue("/uploads/new-cover.png");
    service.updateCourse.mockRejectedValue(versionConflict());

    act(() => result.current.setImage(new File(["x"], "cover.png"), "blob:preview"));
    await act(async () => {
      await result.current.saveAggregate();
    });

    expect(result.current.imagePreview).toBe("blob:preview");
  });

  it("clears the pending file once a save carrying it is accepted", async () => {
    const { result } = await loadedEditor();
    service.uploadCourseImage.mockResolvedValue("/uploads/new-cover.png");
    service.updateCourse.mockResolvedValue({ ...courseState(5), image: "/uploads/new-cover.png" });

    act(() => result.current.setImage(new File(["x"], "cover.png"), "blob:preview"));
    await act(async () => {
      await result.current.saveAggregate();
    });

    expect(result.current.imagePreview).toBeNull();
    expect(result.current.imageFile).toBeNull();
  });
});
