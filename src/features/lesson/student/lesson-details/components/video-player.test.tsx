import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VideoPlayer } from "./video-player";
import { resolveVideoUrl } from "@/shared/video";
import type { VideoSource } from "@/shared/video";

function sourceOf(url: string): VideoSource {
  const resolution = resolveVideoUrl(url);
  if (!resolution.ok) throw new Error(`fixture URL did not resolve: ${url}`);
  return resolution.source;
}

const YOUTUBE = sourceOf("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
const VIMEO = sourceOf("https://vimeo.com/76979871");

/**
 * Delivers a player message the way the real frame would. Wrapped in `act` because the message
 * raises the component's flash state, which React expects a test to have accounted for.
 */
function endTheVideo(frame: HTMLIFrameElement, origin: string, payload: unknown) {
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data: JSON.stringify(payload),
        origin,
        source: frame.contentWindow,
      }),
    );
  });
}

/**
 * The lesson's side of playback: what the learner sees, and — the part that matters — that
 * finishing a video completes the lesson identically on both platforms.
 */
describe("VideoPlayer", () => {
  it("plays a YouTube lesson", () => {
    render(<VideoPlayer source={YOUTUBE} lessonTitle="درس" onVideoEnd={vi.fn()} isMarked={false} />);

    expect((screen.getByTitle("درس") as HTMLIFrameElement).src).toContain("youtube.com/embed");
  });

  it("plays a Vimeo lesson", () => {
    render(<VideoPlayer source={VIMEO} lessonTitle="درس" onVideoEnd={vi.fn()} isMarked={false} />);

    expect((screen.getByTitle("درس") as HTMLIFrameElement).src).toContain("player.vimeo.com/video");
  });

  /** Completion is the video's to trigger, and both platforms trigger it the same way. */
  it("completes the lesson when a YouTube video ends", async () => {
    const onVideoEnd = vi.fn();
    render(<VideoPlayer source={YOUTUBE} lessonTitle="درس" onVideoEnd={onVideoEnd} isMarked={false} />);

    endTheVideo(screen.getByTitle("درس") as HTMLIFrameElement, "https://www.youtube.com", {
      event: "onStateChange",
      info: 0,
    });

    await waitFor(() => expect(onVideoEnd).toHaveBeenCalledTimes(1));
  });

  it("completes the lesson when a Vimeo video ends", async () => {
    const onVideoEnd = vi.fn();
    render(<VideoPlayer source={VIMEO} lessonTitle="درس" onVideoEnd={onVideoEnd} isMarked={false} />);

    endTheVideo(screen.getByTitle("درس") as HTMLIFrameElement, "https://player.vimeo.com", {
      event: "ended",
    });

    await waitFor(() => expect(onVideoEnd).toHaveBeenCalledTimes(1));
  });

  /** A gated lesson reports the video as watched but does not claim completion. */
  it("shows the quiz-required flash instead of completion when a quiz is still owed", async () => {
    const onVideoEnd = vi.fn();
    render(
      <VideoPlayer
        source={VIMEO}
        lessonTitle="درس"
        onVideoEnd={onVideoEnd}
        isMarked={false}
        quizRequired
      />,
    );

    endTheVideo(screen.getByTitle("درس") as HTMLIFrameElement, "https://player.vimeo.com", {
      event: "ended",
    });

    await waitFor(() => expect(onVideoEnd).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/أكمل الاختبار/)).toBeInTheDocument();
  });

  it("reports where the lesson stands before the video is finished", () => {
    render(<VideoPlayer source={YOUTUBE} lessonTitle="درس" onVideoEnd={vi.fn()} isMarked={false} />);

    expect(screen.getByText("يكتمل تلقائياً عند انتهاء الفيديو")).toBeInTheDocument();
  });

  it("reports a completed lesson as complete", () => {
    render(<VideoPlayer source={YOUTUBE} lessonTitle="درس" onVideoEnd={vi.fn()} isMarked />);

    expect(screen.getByText("مكتمل")).toBeInTheDocument();
  });

  /**
   * A lesson whose link Manara cannot place still opens. The page keeps its header, description,
   * quiz and navigation; only the frame is replaced.
   */
  it("shows an unavailable state rather than an empty frame when there is no playable video", () => {
    render(<VideoPlayer source={null} lessonTitle="درس" onVideoEnd={vi.fn()} isMarked={false} />);

    expect(screen.getByText("لا يمكن تشغيل هذا الفيديو حالياً")).toBeInTheDocument();
    expect(screen.queryByTitle("درس")).not.toBeInTheDocument();
  });
});
