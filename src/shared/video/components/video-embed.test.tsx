import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VideoEmbed } from "./video-embed";
import { resolveVideoUrl } from "../video.resolver";
import type { VideoPlaybackEvent, VideoSource } from "../video.types";

function sourceOf(url: string): VideoSource {
  const resolution = resolveVideoUrl(url);
  if (!resolution.ok) throw new Error(`fixture URL did not resolve: ${url}`);
  return resolution.source;
}

const YOUTUBE = sourceOf("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
const VIMEO = sourceOf("https://vimeo.com/76979871");
const VIMEO_UNLISTED = sourceOf("https://vimeo.com/76979871?h=abc123def4");

/**
 * Delivers a message the way a player's frame would, so the component's own origin and source
 * checks are exercised rather than bypassed.
 */
function postFromPlayer(frame: HTMLIFrameElement, origin: string, payload: unknown) {
  window.dispatchEvent(
    new MessageEvent("message", {
      data: JSON.stringify(payload),
      origin,
      source: frame.contentWindow,
    }),
  );
}

describe("VideoEmbed", () => {
  it("points a YouTube video at the YouTube player", () => {
    render(<VideoEmbed source={YOUTUBE} title="درس" />);

    const frame = screen.getByTitle("درس") as HTMLIFrameElement;
    expect(frame.src).toContain("https://www.youtube.com/embed/dQw4w9WgXcQ");
    expect(frame.src).toContain("enablejsapi=1");
  });

  it("points a Vimeo video at the Vimeo player", () => {
    render(<VideoEmbed source={VIMEO} title="درس" />);

    const frame = screen.getByTitle("درس") as HTMLIFrameElement;
    expect(frame.src).toContain("https://player.vimeo.com/video/76979871");
  });

  it("carries the unlisted-link token into the Vimeo embed", () => {
    render(<VideoEmbed source={VIMEO_UNLISTED} title="درس" />);

    const frame = screen.getByTitle("درس") as HTMLIFrameElement;
    expect(frame.src).toContain("h=abc123def4");
  });

  /**
   * The point of the abstraction, stated as a test: the same normalised event reaches lesson logic
   * from two platforms whose wire formats have nothing in common.
   */
  it("reports a YouTube end and a Vimeo end as the same event", async () => {
    const youtubeEvents: VideoPlaybackEvent[] = [];
    const { unmount } = render(
      <VideoEmbed source={YOUTUBE} title="yt" onPlaybackEvent={(e) => youtubeEvents.push(e)} />,
    );
    const youtubeFrame = screen.getByTitle("yt") as HTMLIFrameElement;
    // YouTube's own wire format: state 0 is ENDED.
    postFromPlayer(youtubeFrame, "https://www.youtube.com", { event: "onStateChange", info: 0 });

    await waitFor(() => expect(youtubeEvents).toHaveLength(1));
    unmount();

    const vimeoEvents: VideoPlaybackEvent[] = [];
    render(<VideoEmbed source={VIMEO} title="vm" onPlaybackEvent={(e) => vimeoEvents.push(e)} />);
    const vimeoFrame = screen.getByTitle("vm") as HTMLIFrameElement;
    // Vimeo's: a named event.
    postFromPlayer(vimeoFrame, "https://player.vimeo.com", { event: "ended" });

    await waitFor(() => expect(vimeoEvents).toHaveLength(1));

    expect(youtubeEvents[0].state).toBe("ended");
    expect(vimeoEvents[0].state).toBe("ended");
    expect(youtubeEvents[0].provider).toBe("YOUTUBE");
    expect(vimeoEvents[0].provider).toBe("VIMEO");
  });

  it("normalises the intermediate states of both platforms", async () => {
    const events: VideoPlaybackEvent[] = [];
    render(<VideoEmbed source={YOUTUBE} title="yt" onPlaybackEvent={(e) => events.push(e)} />);
    const frame = screen.getByTitle("yt") as HTMLIFrameElement;

    postFromPlayer(frame, "https://www.youtube.com", { event: "onStateChange", info: 1 });
    postFromPlayer(frame, "https://www.youtube.com", { event: "onStateChange", info: 2 });

    await waitFor(() => expect(events).toHaveLength(2));
    expect(events.map((e) => e.state)).toEqual(["playing", "paused"]);
  });

  /**
   * One end of a video is reported twice — YouTube sends it in two message shapes. Lesson
   * completion must fire once.
   */
  it("collapses a repeated report of the same state", async () => {
    const events: VideoPlaybackEvent[] = [];
    render(<VideoEmbed source={YOUTUBE} title="yt" onPlaybackEvent={(e) => events.push(e)} />);
    const frame = screen.getByTitle("yt") as HTMLIFrameElement;

    postFromPlayer(frame, "https://www.youtube.com", { event: "onStateChange", info: 0 });
    postFromPlayer(frame, "https://www.youtube.com", {
      event: "infoDelivery",
      info: { playerState: 0 },
    });

    await waitFor(() => expect(events).toHaveLength(1));
    expect(events[0].state).toBe("ended");
  });

  /**
   * The security property. `postMessage` can be sent by anything on the page; without the origin
   * check any script could announce that the video ended and complete a lesson for the learner.
   */
  it("ignores a message from the wrong origin", async () => {
    const onPlaybackEvent = vi.fn();
    render(<VideoEmbed source={YOUTUBE} title="yt" onPlaybackEvent={onPlaybackEvent} />);
    const frame = screen.getByTitle("yt") as HTMLIFrameElement;

    postFromPlayer(frame, "https://evil.example", { event: "onStateChange", info: 0 });
    // A Vimeo-shaped message on the YouTube player's own origin is also not a YouTube end.
    postFromPlayer(frame, "https://player.vimeo.com", { event: "ended" });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(onPlaybackEvent).not.toHaveBeenCalled();
  });

  it("ignores a message that did not come from its own frame", async () => {
    const onPlaybackEvent = vi.fn();
    render(<VideoEmbed source={YOUTUBE} title="yt" onPlaybackEvent={onPlaybackEvent} />);

    window.dispatchEvent(
      new MessageEvent("message", {
        data: JSON.stringify({ event: "onStateChange", info: 0 }),
        origin: "https://www.youtube.com",
        source: window,
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(onPlaybackEvent).not.toHaveBeenCalled();
  });

  it("does not grant the frame any permission beyond what playback needs", () => {
    render(<VideoEmbed source={VIMEO} title="درس" />);

    const frame = screen.getByTitle("درس") as HTMLIFrameElement;
    const allow = frame.getAttribute("allow") ?? "";
    expect(allow).not.toContain("camera");
    expect(allow).not.toContain("microphone");
    expect(allow).not.toContain("geolocation");
    expect(frame.getAttribute("referrerpolicy")).toBe("strict-origin-when-cross-origin");
  });
});
