import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LessonForm } from "./lesson-form";
import type { CourseLessonEditorState } from "@/shared/courses";

function existingLesson(overrides: Partial<CourseLessonEditorState> = {}): CourseLessonEditorState {
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

const videoInput = () => screen.getByPlaceholderText(/youtube\.com/i);

/**
 * The instructor's video input. The product concept here is "a video", not "a YouTube video", so
 * these tests are about both platforms being first-class in the same field — including switching a
 * saved lesson from one to the other.
 */
describe("LessonForm video input", () => {
  it("accepts a YouTube link and previews it as YouTube", async () => {
    const user = userEvent.setup();
    render(<LessonForm lessonNumber={1} onSave={vi.fn()} onCancel={vi.fn()} />);

    await user.type(videoInput(), "https://youtu.be/dQw4w9WgXcQ");

    expect(await screen.findByText("YouTube")).toBeInTheDocument();
  });

  it("accepts a Vimeo link and previews it as Vimeo", async () => {
    const user = userEvent.setup();
    render(<LessonForm lessonNumber={1} onSave={vi.fn()} onCancel={vi.fn()} />);

    await user.type(videoInput(), "https://vimeo.com/76979871");

    expect(await screen.findByText("Vimeo")).toBeInTheDocument();
  });

  /** The reason each refusal is told apart: they send the instructor to different fixes. */
  it("says the platform is unsupported for a link Manara cannot play", async () => {
    const user = userEvent.setup();
    render(<LessonForm lessonNumber={1} onSave={vi.fn()} onCancel={vi.fn()} />);

    await user.type(videoInput(), "https://dailymotion.com/video/x8abcd");

    expect(await screen.findByText(/منصة الفيديو غير مدعومة/)).toBeInTheDocument();
  });

  it("says the link is malformed for something that is not a web address", async () => {
    const user = userEvent.setup();
    render(<LessonForm lessonNumber={1} onSave={vi.fn()} onCancel={vi.fn()} />);

    await user.type(videoInput(), "just some text");

    expect(await screen.findByText(/رابط الفيديو غير صحيح/)).toBeInTheDocument();
  });

  it("says the link names no video when the platform is right but the link is not", async () => {
    const user = userEvent.setup();
    render(<LessonForm lessonNumber={1} onSave={vi.fn()} onCancel={vi.fn()} />);

    await user.type(videoInput(), "https://vimeo.com/notanumber");

    expect(await screen.findByText(/لا يشير إلى فيديو/)).toBeInTheDocument();
  });

  it("refuses to save a lesson whose video cannot be played", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<LessonForm lessonNumber={1} onSave={onSave} onCancel={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("مثال: مقدمة في البرمجة"), "درس جديد");
    await user.type(videoInput(), "https://example.com/lesson.mp4");
    await user.click(screen.getByRole("button", { name: /حفظ الدرس/ }));

    expect(onSave).not.toHaveBeenCalled();
  });

  /** An existing YouTube lesson opens showing its own link, unchanged. */
  it("opens an existing YouTube lesson with its link intact", async () => {
    render(
      <LessonForm initial={existingLesson()} lessonNumber={1} onSave={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(videoInput()).toHaveValue("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(await screen.findByText("YouTube")).toBeInTheDocument();
  });

  it("lets an instructor replace a YouTube video with a Vimeo one", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <LessonForm initial={existingLesson()} lessonNumber={1} onSave={onSave} onCancel={vi.fn()} />,
    );

    await user.clear(videoInput());
    await user.type(videoInput(), "https://vimeo.com/76979871");
    expect(await screen.findByText("Vimeo")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /حفظ الدرس/ }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    // Only the URL travels; the platform is the server's to derive.
    expect(onSave.mock.calls[0][0].videoUrl).toBe("https://vimeo.com/76979871");
    expect(onSave.mock.calls[0][0]).not.toHaveProperty("videoProvider");
  });

  it("lets an instructor replace a Vimeo video with a YouTube one", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <LessonForm
        initial={existingLesson({ videoUrl: "https://vimeo.com/76979871" })}
        lessonNumber={1}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    expect(await screen.findByText("Vimeo")).toBeInTheDocument();

    await user.clear(videoInput());
    await user.type(videoInput(), "https://youtu.be/dQw4w9WgXcQ");
    expect(await screen.findByText("YouTube")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /حفظ الدرس/ }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0].videoUrl).toBe("https://youtu.be/dQw4w9WgXcQ");
  });
});
