import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LessonPage } from "./pages/lesson-page";
import type { LessonDetailsResponse, LessonResponse } from "@/shared/courses";

/**
 * What a learner actually gets, per lesson type.
 *
 * Driven through the page rather than the components, so the content-type dispatch, the hook's
 * completion rules and the renderer are all exercised on the path a learner really takes. The
 * mocked layer is the HTTP client, which is the only thing that has to be faked.
 */

vi.mock("./api/lesson.api", () => ({
  fetchLessonById: vi.fn(),
  fetchCourseSummary: vi.fn(),
  markLessonCompleted: vi.fn(),
}));

import * as api from "./api/lesson.api";

const fetchLessonById = vi.mocked(api.fetchLessonById);
const fetchCourseSummary = vi.mocked(api.fetchCourseSummary);
const markLessonCompleted = vi.mocked(api.markLessonCompleted);

const DOCUMENT = JSON.stringify({
  version: 1,
  blocks: [
    { type: "heading", level: 2, content: [{ type: "text", text: "ما هو التفكير النقدي؟" }] },
    { type: "paragraph", content: [{ type: "text", text: "التفكير النقدي هو القدرة على تحليل المعلومات." }] },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "اقرأ المزيد", marks: [{ type: "link", href: "https://example.com/more" }] },
      ],
    },
    { type: "cta", label: "ابدأ التمرين", href: "https://example.com/exercise", variant: "PRIMARY", align: "CENTER" },
  ],
});

function lessonResponse(overrides: Partial<LessonResponse> = {}): LessonResponse {
  return {
    id: 2,
    title: "مقدمة في التفكير النقدي",
    summary: null,
    description: "",
    contentType: "VIDEO",
    richContent: null,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoProvider: "YOUTUBE",
    externalVideoId: "dQw4w9WgXcQ",
    videoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoThumbnailUrl: null,
    duration: "10m",
    orderIndex: 1,
    courseId: 1,
    moduleId: null,
    isCompleted: false,
    locked: false,
    quiz: null,
    change: null,
    createdAt: null,
    ...overrides,
  };
}

function details(lesson: LessonResponse): LessonDetailsResponse {
  return { lesson, previous: null, next: null };
}

function renderPage() {
  render(
    <LessonPage
      courseId={1}
      lessonId={2}
      onBackToCourseDetails={vi.fn()}
      onBackToCourses={vi.fn()}
      onBackToHome={vi.fn()}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  fetchCourseSummary.mockResolvedValue({
    course: { id: 1, title: "دورة", lessonCount: 4 },
    lessons: [],
    modules: [],
    progress: 25,
  } as never);
});

describe("a rich-content lesson", () => {
  beforeEach(() => {
    fetchLessonById.mockResolvedValue(
      details(lessonResponse({ contentType: "RICH_CONTENT", richContent: DOCUMENT, videoUrl: null })),
    );
  });

  it("renders the authored content", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { level: 2, name: "ما هو التفكير النقدي؟" })).toBeInTheDocument();
    expect(screen.getByText(/التفكير النقدي هو القدرة/)).toBeInTheDocument();
  });

  it("renders no video UI of any kind", async () => {
    renderPage();
    await screen.findByRole("heading", { level: 2, name: "ما هو التفكير النقدي؟" });

    // The requirement stated exactly: no player, no empty frame, no play control, no fake duration.
    // The component is not rendered at all, so there is nothing to be mistaken for a failed video.
    expect(document.querySelector("iframe")).toBeNull();
    expect(screen.queryByText("10m")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /تشغيل|play/i })).not.toBeInTheDocument();
  });

  it("renders the instructor's links and buttons as navigation", async () => {
    renderPage();

    const link = await screen.findByRole("link", { name: "اقرأ المزيد" });
    expect(link).toHaveAttribute("href", "https://example.com/more");

    const cta = screen.getByRole("link", { name: "ابدأ التمرين" });
    expect(cta).toHaveAttribute("href", "https://example.com/exercise");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("offers Manara's own completion control", async () => {
    renderPage();
    expect(await screen.findByRole("button", { name: /إكمال الدرس/ })).toBeEnabled();
  });

  it("records completion and shows a completed state", async () => {
    const user = userEvent.setup();
    markLessonCompleted.mockResolvedValue({
      lessonId: 2,
      completed: true,
      courseProgress: 50,
      nextLessonId: 3,
      courseCompleted: false,
    } as never);
    // The page re-reads the lesson from the server after completing rather than editing its own
    // copy, so the second answer is the completed one.
    fetchLessonById
      .mockResolvedValueOnce(
        details(lessonResponse({ contentType: "RICH_CONTENT", richContent: DOCUMENT, videoUrl: null })),
      )
      .mockResolvedValue(
        details(
          lessonResponse({
            contentType: "RICH_CONTENT",
            richContent: DOCUMENT,
            videoUrl: null,
            isCompleted: true,
          }),
        ),
      );

    renderPage();
    await user.click(await screen.findByRole("button", { name: /إكمال الدرس/ }));

    await waitFor(() => expect(markLessonCompleted).toHaveBeenCalledWith(1, 2));
    expect(await screen.findByText("تم إكمال الدرس")).toBeInTheDocument();
  });

  it("sends one completion however many times the button is pressed", async () => {
    const user = userEvent.setup();
    markLessonCompleted.mockResolvedValue({
      lessonId: 2,
      completed: true,
      courseProgress: 50,
      nextLessonId: null,
      courseCompleted: false,
    } as never);

    renderPage();
    const button = await screen.findByRole("button", { name: /إكمال الدرس/ });
    await user.dblClick(button);

    await waitFor(() => expect(markLessonCompleted).toHaveBeenCalledTimes(1));
  });

  it("keeps the lesson incomplete and allows a retry when completion fails", async () => {
    const user = userEvent.setup();
    markLessonCompleted.mockRejectedValueOnce(new Error("network"));

    renderPage();
    const button = await screen.findByRole("button", { name: /إكمال الدرس/ });
    await user.click(button);

    // No false tick: the lesson is only complete when the server says so.
    await waitFor(() => expect(screen.queryByText("تم إكمال الدرس")).not.toBeInTheDocument());
    expect(await screen.findByRole("button", { name: /إكمال الدرس/ })).toBeEnabled();

    markLessonCompleted.mockResolvedValueOnce({
      lessonId: 2,
      completed: true,
      courseProgress: 50,
      nextLessonId: null,
      courseCompleted: false,
    } as never);
    await user.click(screen.getByRole("button", { name: /إكمال الدرس/ }));

    await waitFor(() => expect(markLessonCompleted).toHaveBeenCalledTimes(2));
  });
});

describe("a video lesson", () => {
  it("still renders the player and no completion button", async () => {
    fetchLessonById.mockResolvedValue(details(lessonResponse()));

    renderPage();
    // The title appears in the breadcrumb as well as the header, so the heading is the anchor.
    await screen.findByRole("heading", { name: "مقدمة في التفكير النقدي" });

    // The regression that matters most: the existing video experience is untouched, and a video
    // lesson does not grow a second way to be completed.
    await waitFor(() => expect(document.querySelector("iframe")).not.toBeNull());
    expect(screen.queryByRole("button", { name: /إكمال الدرس/ })).not.toBeInTheDocument();
  });
});

describe("the reading layout", () => {
  /**
   * The bug this feature exists to fix: the lesson route asks the shell for its full width, and a
   * lesson that is read took all of it — a very wide card with a narrow strip of text centred in
   * it. These check the three constraints that replaced it are actually applied, and that a video
   * lesson is not dragged into them.
   */

  it("constrains the page, the surface and the reading column for a lesson that is read", async () => {
    fetchLessonById.mockResolvedValue(
      details(lessonResponse({ contentType: "RICH_CONTENT", richContent: DOCUMENT, videoUrl: null })),
    );

    renderPage();
    await screen.findByRole("heading", { level: 2, name: "ما هو التفكير النقدي؟" });

    // The page column the header and breadcrumb align to.
    expect(document.querySelector(".lp-page--reading")).not.toBeNull();
    // The surface inset inside it, holding the article and the footer.
    expect(document.querySelector(".lp-page--reading .lp-reading-surface")).not.toBeNull();
    // The measure, on the rendered document itself.
    expect(document.querySelector(".lp-reading-surface .lp-reading-card .mrc.lp-reading-column")).not.toBeNull();
  });

  it("gives a lesson that is read no rail", async () => {
    fetchLessonById.mockResolvedValue(
      details(lessonResponse({ contentType: "RICH_CONTENT", richContent: DOCUMENT, videoUrl: null })),
    );

    renderPage();
    await screen.findByRole("heading", { level: 2, name: "ما هو التفكير النقدي؟" });

    // The two-column layout is the video lesson's, and the rail beside a column of text is what
    // left the article stranded in a very wide card.
    expect(document.querySelector(".lp-two-col")).toBeNull();
    expect(document.querySelector(".lp-curriculum-col")).toBeNull();
  });

  it("leaves a video lesson's layout exactly as it was", async () => {
    fetchLessonById.mockResolvedValue(details(lessonResponse()));

    renderPage();
    await screen.findByRole("heading", { name: "مقدمة في التفكير النقدي" });

    // The regression guard: nothing about the reading grid reaches a lesson that is watched.
    expect(document.querySelector(".lp-page--reading")).toBeNull();
    expect(document.querySelector(".lp-reading-surface")).toBeNull();
    expect(document.querySelector(".lp-two-col")).not.toBeNull();
  });

  it("puts previous, complete and next in one row, in reading order", async () => {
    fetchLessonById.mockResolvedValue({
      lesson: lessonResponse({ contentType: "RICH_CONTENT", richContent: DOCUMENT, videoUrl: null }),
      previous: { id: 1, title: "الدرس الأول" },
      next: { id: 3, title: "الدرس الثالث" },
    } as never);

    renderPage();
    const footer = await screen.findByRole("navigation", { name: "التنقل بين الدروس" });

    // Document order is previous, the action, then next. Under dir="rtl" the browser places the
    // first cell on the right — the navigation is logical rather than a visual swap, so the same
    // markup reads correctly in either direction.
    const cells = Array.from(footer.children);
    expect(cells).toHaveLength(3);
    expect(cells[0].textContent).toContain("الدرس الأول");
    expect(cells[1].textContent).toContain("إكمال الدرس");
    expect(cells[2].textContent).toContain("الدرس الثالث");
  });

  it("offers exactly one control that can complete the lesson", async () => {
    fetchLessonById.mockResolvedValue(
      details(lessonResponse({ contentType: "RICH_CONTENT", richContent: DOCUMENT, videoUrl: null })),
    );

    renderPage();
    await screen.findByRole("heading", { level: 2, name: "ما هو التفكير النقدي؟" });

    // Moving the button into the footer must not leave a second copy behind: two ways to record
    // the same thing is the failure the video branch was written to avoid.
    expect(screen.getAllByRole("button", { name: /إكمال الدرس/ })).toHaveLength(1);
    // And the instructor's own call-to-action is still a link, so it cannot complete anything.
    expect(screen.getByRole("link", { name: "ابدأ التمرين" })).toBeInTheDocument();
  });

  it("keeps the completion row when the lesson has no neighbours to navigate to", async () => {
    fetchLessonById.mockResolvedValue(
      details(lessonResponse({ contentType: "RICH_CONTENT", richContent: DOCUMENT, videoUrl: null })),
    );

    renderPage();

    // A one-lesson course still has a lesson to finish. The row that carries the button must not
    // disappear along with the navigation it also carries.
    expect(await screen.findByRole("button", { name: /إكمال الدرس/ })).toBeInTheDocument();
  });
});

describe("the updated badge", () => {
  it("is shown alongside the completed state, not instead of it", async () => {
    fetchLessonById.mockResolvedValue(
      details(
        lessonResponse({
          contentType: "RICH_CONTENT",
          richContent: DOCUMENT,
          videoUrl: null,
          isCompleted: true,
          change: { state: "UPDATED", summary: "تم تحديث محتوى الدرس", at: null },
        }),
      ),
    );

    renderPage();

    // Completed and Updated are different facts and coexist: one is the learner's progress, the
    // other is that the material moved under them since they enrolled.
    expect(await screen.findByText("تم التحديث")).toBeInTheDocument();
    expect(screen.getByText("مكتمل")).toBeInTheDocument();
  });

  it("is absent for a learner with nothing to be told", async () => {
    fetchLessonById.mockResolvedValue(
      details(lessonResponse({ contentType: "RICH_CONTENT", richContent: DOCUMENT, videoUrl: null })),
    );

    renderPage();
    await screen.findByRole("heading", { level: 2, name: "ما هو التفكير النقدي؟" });

    // A learner who enrolled after the last edit must not see a historical update.
    expect(screen.queryByText("تم التحديث")).not.toBeInTheDocument();
  });
});
