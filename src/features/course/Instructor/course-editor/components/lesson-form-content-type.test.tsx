import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LessonForm } from "./lesson-form";
import type { CourseLessonEditorState } from "@/shared/courses";

/**
 * The instructor's choice between the two kinds of lesson.
 *
 * The editor itself is lazily loaded and is a ProseMirror instance, which jsdom is a poor place to
 * drive — its own translation layer is tested directly in `tiptap-bridge.test.ts` instead. What is
 * tested here is the part that decides what an instructor is shown and what leaves the form, which
 * is where the video-only assumptions actually lived.
 */

function lesson(overrides: Partial<CourseLessonEditorState> = {}): CourseLessonEditorState {
  return {
    key: "lesson-1",
    id: 1,
    title: "درس",
    summary: "",
    description: "",
    contentType: "VIDEO",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    richContent: null,
    videoThumbnailUrl: null,
    quiz: null,
    ...overrides,
  };
}

const DOCUMENT = JSON.stringify({
  version: 1,
  blocks: [{ type: "paragraph", content: [{ type: "text", text: "نص تجريبي للدرس" }] }],
});

function renderForm(initial?: CourseLessonEditorState) {
  const onSave = vi.fn();
  render(<LessonForm initial={initial} lessonNumber={1} onSave={onSave} onCancel={vi.fn()} />);
  return { onSave };
}

describe("LessonForm lesson type", () => {
  it("offers both kinds of lesson, with video selected by default for a new lesson", () => {
    renderForm();

    expect(screen.getByRole("radio", { name: /فيديو/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /محتوى/ })).toHaveAttribute("aria-checked", "false");
  });

  it("shows the video field for a video lesson and no content editor", () => {
    renderForm();

    expect(screen.getByPlaceholderText(/youtube\.com/i)).toBeInTheDocument();
    expect(screen.queryByText("محتوى الدرس", { selector: "label" })).not.toBeInTheDocument();
  });

  it("shows the content editor for a rich-content lesson and no video field", async () => {
    renderForm(lesson({ contentType: "RICH_CONTENT", richContent: DOCUMENT, videoUrl: "" }));

    // The video field is not disabled or hidden — it is not rendered, so there is no empty URL box
    // on a lesson that will never have a video.
    expect(screen.queryByPlaceholderText(/youtube\.com/i)).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("محتوى الدرس", { selector: "label" })).toBeInTheDocument());
  });

  it("asks before switching a lesson that already has content, and can be cancelled", async () => {
    const user = userEvent.setup();
    renderForm(lesson());

    await user.click(screen.getByRole("radio", { name: /محتوى/ }));

    // Not switched yet: the instructor has a video and is being asked first.
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(/لن يُفقد الرابط/);
    expect(screen.getByRole("radio", { name: /فيديو/ })).toHaveAttribute("aria-checked", "true");

    // Scoped to the dialog: the form has its own cancel button, and pressing that one would
    // abandon the whole lesson rather than the type change.
    await user.click(within(dialog).getByRole("button", { name: "إلغاء" }));

    // waitFor because the confirmation animates out rather than vanishing.
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.getByRole("radio", { name: /فيديو/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByPlaceholderText(/youtube\.com/i)).toBeInTheDocument();
  });

  it("switches once the instructor confirms", async () => {
    const user = userEvent.setup();
    renderForm(lesson());

    await user.click(screen.getByRole("radio", { name: /محتوى/ }));
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "متابعة" }));

    expect(screen.getByRole("radio", { name: /محتوى/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByPlaceholderText(/youtube\.com/i)).not.toBeInTheDocument();
  });

  it("does not interrupt a switch when there is nothing to lose", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("radio", { name: /محتوى/ }));

    // A brand-new lesson with an empty URL field: nothing has been authored, so there is nothing
    // to warn about and the instructor is not stopped.
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /محتوى/ })).toHaveAttribute("aria-checked", "true");
  });

  it("keeps the video when switched away and back, so nothing is silently lost", async () => {
    const user = userEvent.setup();
    const { onSave } = renderForm(lesson());

    await user.click(screen.getByRole("radio", { name: /محتوى/ }));
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "متابعة" }));
    await user.click(screen.getByRole("radio", { name: /فيديو/ }));

    // The URL is back in the field, not cleared: retention is what makes a type change reversible
    // rather than destructive.
    expect(screen.getByPlaceholderText(/youtube\.com/i)).toHaveValue(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );

    await user.click(screen.getByRole("button", { name: /حفظ الدرس/ }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      contentType: "VIDEO",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
  });

  it("saves a rich-content lesson without asking for a video", async () => {
    const user = userEvent.setup();
    const { onSave } = renderForm(
      lesson({ contentType: "RICH_CONTENT", richContent: DOCUMENT, videoUrl: "" }),
    );

    await waitFor(() => expect(screen.getByText("محتوى الدرس", { selector: "label" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /حفظ الدرس/ }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0]).toMatchObject({ contentType: "RICH_CONTENT" });
    expect(onSave.mock.calls[0][0].richContent).toContain("نص تجريبي للدرس");
  });

  it("refuses to save a rich-content lesson with nothing in it", async () => {
    const user = userEvent.setup();
    const { onSave } = renderForm(lesson({ contentType: "RICH_CONTENT", richContent: null, videoUrl: "" }));

    await waitFor(() => expect(screen.getByText("محتوى الدرس", { selector: "label" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /حفظ الدرس/ }));

    expect(await screen.findByText("يرجى إضافة محتوى للدرس")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not complain about a retained video URL while the lesson is rich content", async () => {
    const user = userEvent.setup();
    // A lesson switched to content whose retained URL is one Manara cannot play. The video rules do
    // not apply to it any more, so it must not block the save.
    const { onSave } = renderForm(
      lesson({ contentType: "RICH_CONTENT", richContent: DOCUMENT, videoUrl: "not a url at all" }),
    );

    await waitFor(() => expect(screen.getByText("محتوى الدرس", { selector: "label" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /حفظ الدرس/ }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
  });
});
