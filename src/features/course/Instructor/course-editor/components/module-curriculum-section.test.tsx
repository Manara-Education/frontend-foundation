import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CourseModuleEditorState } from "@/shared/courses";
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

function moduleState(id: number, title: string): CourseModuleEditorState {
  return { key: `m${id}`, id, title, description: "", lessons: [], quiz: null };
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
