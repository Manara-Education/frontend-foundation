import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CourseLessonEditorState, CourseModuleEditorState } from "@/shared/courses";
import { ModuleCurriculumSection } from "./module-curriculum-section";

/**
 * Captures what each `Reorder.Item` was actually given.
 *
 * Motion's drag gestures need a pointer, a layout and real element boxes, none of which
 * jsdom has — so driving a genuine drag here would test the mock, not the wiring. What is
 * worth pinning down is the wiring itself, because the wiring is exactly what was missing:
 * the module rows were rendered with no `onDragEnd` at all, so a finished drag notified
 * nobody and the new order never left the browser.
 */
const items: Array<{ value: unknown; onDragEnd?: () => void }> = [];

vi.mock("motion/react", async () => {
  const React = await import("react");

  // Cached per tag. A fresh component identity on every property access would make React
  // remount the element each render, which resets the inline forms' own state mid-typing.
  const cache = new Map<string, React.ComponentType<Record<string, unknown>>>();
  const passthrough = (tag: string) => {
    const existing = cache.get(tag);
    if (existing) return existing;
    const Component = ({
      children,
      ...props
    }: Record<string, unknown> & { children?: React.ReactNode }) => {
      const safe = { ...props };
      for (const motionOnly of [
        "initial", "animate", "exit", "transition", "layout", "whileHover", "whileTap",
      ]) {
        delete safe[motionOnly];
      }
      return React.createElement(tag, safe, children);
    };
    cache.set(tag, Component as React.ComponentType<Record<string, unknown>>);
    return Component;
  };

  return {
    motion: new Proxy({}, { get: (_t, tag: string) => passthrough(tag) }),
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
    useDragControls: () => ({ start: vi.fn() }),
    Reorder: {
      Group: ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) =>
        React.createElement("ul", { style: props.style as object }, children),
      Item: ({
        children,
        value,
        onDragEnd,
        ...props
      }: Record<string, unknown> & { children?: React.ReactNode; value: unknown; onDragEnd?: () => void }) => {
        items.push({ value, onDragEnd });
        return React.createElement("li", { style: props.style as object }, children);
      },
    },
  };
});

function lessonState(id: number, title: string): CourseLessonEditorState {
  return {
    key: `l${id}`,
    id,
    title,
    summary: "",
    description: "",
    contentType: "VIDEO",
    videoUrl: "https://youtu.be/x",
    richContent: null,
    videoThumbnailUrl: null,
    quiz: null,
  };
}

function moduleState(
  id: number,
  title: string,
  lessons: ReturnType<typeof lessonState>[] = [],
): CourseModuleEditorState {
  return { key: `m${id}`, id, title, description: "", lessons, quiz: null };
}

const MODULES = [moduleState(1, "مقدمة"), moduleState(2, "أساسيات"), moduleState(3, "متقدم")];

function renderSection(overrides: Partial<React.ComponentProps<typeof ModuleCurriculumSection>> = {}) {
  const props = {
    modules: MODULES,
    onAddModule: vi.fn(() => "new"),
    onUpdateModule: vi.fn(),
    onDeleteModule: vi.fn(),
    onReorderModules: vi.fn(),
    onReorderModulesCommit: vi.fn(),
    onSaveModuleLesson: vi.fn(),
    onDeleteModuleLesson: vi.fn(),
    onReorderModuleLessons: vi.fn(),
    onReorderModuleLessonsCommit: vi.fn(),
    ...overrides,
  };
  render(<ModuleCurriculumSection {...props} />);
  return props;
}

beforeEach(() => {
  items.length = 0;
});

describe("dragging a module", () => {
  it("commits the new order when the drag ends", () => {
    const props = renderSection();

    // One row per module, each carrying the callback that persists the drop.
    const moduleRows = items.filter((item) => MODULES.includes(item.value as CourseModuleEditorState));
    expect(moduleRows).toHaveLength(3);

    moduleRows.forEach((row) => expect(row.onDragEnd).toBeDefined());

    moduleRows[0].onDragEnd?.();
    expect(props.onReorderModulesCommit).toHaveBeenCalledTimes(1);
  });

  it("commits once per drop, not once per module the drag passed over", () => {
    const props = renderSection();
    const moduleRows = items.filter((item) => MODULES.includes(item.value as CourseModuleEditorState));

    moduleRows[2].onDragEnd?.();

    expect(props.onReorderModulesCommit).toHaveBeenCalledTimes(1);
    // `onReorder` is what fires continuously while a module is being dragged past its
    // neighbours; it must never reach the network on its own.
    expect(props.onReorderModules).not.toHaveBeenCalled();
  });

  it("is harmless when the same drop is reported twice", () => {
    const props = renderSection();
    const moduleRows = items.filter((item) => MODULES.includes(item.value as CourseModuleEditorState));

    moduleRows[0].onDragEnd?.();
    moduleRows[0].onDragEnd?.();

    // Two identical commits are safe by construction: the command is the whole order, not
    // a delta, and the backend treats a reorder to the order it already holds as a no-op.
    expect(props.onReorderModulesCommit).toHaveBeenCalledTimes(2);
  });
});

/**
 * The `tabs` variant is the course editor screen — the surface an instructor opens to edit
 * a course that is already live. Nothing here is conditional on publication state, which
 * is the point: a published course is edited through exactly these controls.
 */
describe("editing modules of a published course", () => {
  it("offers edit and delete on every module, whatever the course's publication state", async () => {
    const user = userEvent.setup();
    const props = renderSection({ variant: "tabs" });

    const editButtons = screen.getAllByRole("button", { name: "تعديل" });
    expect(editButtons).toHaveLength(3);

    await user.click(editButtons[0]);
    const titleInput = screen.getByDisplayValue("مقدمة");
    await user.clear(titleInput);
    await user.type(titleInput, "مقدمة معدلة");
    await user.click(screen.getByRole("button", { name: "حفظ" }));

    expect(props.onUpdateModule).toHaveBeenCalledWith(
      "m1",
      expect.objectContaining({ title: "مقدمة معدلة" }),
    );
  });

  it("can add a module", async () => {
    const user = userEvent.setup();
    const props = renderSection({ variant: "tabs" });

    await user.click(screen.getByRole("button", { name: /إضافة وحدة/ }));
    await user.type(screen.getByPlaceholderText("مثال: مقدمة في البرمجة"), "وحدة جديدة");
    await user.click(screen.getByRole("button", { name: "إضافة الوحدة" }));

    expect(props.onAddModule).toHaveBeenCalledWith(
      expect.objectContaining({ title: "وحدة جديدة" }),
    );
  });
});

/**
 * The seam the whole defect lived in.
 *
 * Dragging a lesson inside a module used to reach `onReorderModuleLessonsCommit`, which
 * every consumer wired to the editor's *module*-order commit — so the lesson order was
 * never persisted, and where the module count differed from the lesson count the drag
 * failed outright. The callback carries the module's key now — but TypeScript will not
 * catch the old mistake for us, because a `() => void` is assignable wherever a
 * `(moduleKey: string) => void` is wanted. These tests are the guard, and the reason they
 * assert the argument rather than merely the call count.
 */
describe("dragging a lesson inside a module", () => {
  const WITH_LESSONS = [
    moduleState(1, "مقدمة", [lessonState(11, "الدرس الأول"), lessonState(12, "الدرس الثاني")]),
    moduleState(2, "أساسيات", [lessonState(21, "درس آخر")]),
  ];

  async function renderExpanded(moduleIndex: number) {
    const user = userEvent.setup();
    const props = renderSection({ variant: "tabs", modules: WITH_LESSONS });

    const toggles = screen.getAllByRole("button", { name: "عرض دروس الوحدة" });
    await user.click(toggles[moduleIndex]);
    return props;
  }

  it("commits the lesson order for the module the lesson belongs to", async () => {
    const props = await renderExpanded(0);

    const lessonRows = items.filter((item) =>
      WITH_LESSONS[0].lessons.includes(item.value as (typeof WITH_LESSONS)[0]["lessons"][number]),
    );
    expect(lessonRows).toHaveLength(2);

    lessonRows[0].onDragEnd?.();

    expect(props.onReorderModuleLessonsCommit).toHaveBeenCalledTimes(1);
    expect(props.onReorderModuleLessonsCommit).toHaveBeenCalledWith("m1");
  });

  it("names the second module when the drag happened there", async () => {
    const props = await renderExpanded(1);

    const lessonRows = items.filter((item) =>
      WITH_LESSONS[1].lessons.includes(item.value as (typeof WITH_LESSONS)[1]["lessons"][number]),
    );
    expect(lessonRows).toHaveLength(1);

    lessonRows[0].onDragEnd?.();

    expect(props.onReorderModuleLessonsCommit).toHaveBeenCalledWith("m2");
  });

  it("never reaches the module-order commit", async () => {
    const props = await renderExpanded(0);

    const lessonRows = items.filter((item) =>
      WITH_LESSONS[0].lessons.includes(item.value as (typeof WITH_LESSONS)[0]["lessons"][number]),
    );
    lessonRows[0].onDragEnd?.();

    // The regression, stated directly: a lesson drag must not persist a module order.
    expect(props.onReorderModulesCommit).not.toHaveBeenCalled();
  });
});
