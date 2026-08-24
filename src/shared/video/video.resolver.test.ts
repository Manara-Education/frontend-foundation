import { describe, expect, it } from "vitest";
import { isSupportedVideoUrl, resolveVideoUrl, videoSourceFromResponse } from "./video.resolver";
import { adapterFor } from "./video.providers";

/**
 * The resolver is the single answer to "what is this URL?" on this side of the wire, and its
 * answers must match the backend's for the same input — a URL the server stores has to be one the
 * player can render, and a URL the form rejects has to be one the server would reject too.
 *
 * The cases below are deliberately the same set as the backend's `VideoProviderResolverTest`.
 */
describe("resolveVideoUrl", () => {
  describe("YouTube", () => {
    it.each([
      ["https://youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
      ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
      ["http://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
      ["https://m.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
      ["https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
      ["https://youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
      ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
      ["https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
      ["https://www.youtube.com/live/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
      ["https://www.youtube.com/v/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ])("reads the video id out of %s", (url, expectedId) => {
      const resolution = resolveVideoUrl(url);

      expect(resolution.ok).toBe(true);
      if (!resolution.ok) return;
      expect(resolution.source.provider).toBe("YOUTUBE");
      expect(resolution.source.reference.externalId).toBe(expectedId);
    });

    it("keeps the pasted URL and leaves incidental parameters out of the embed", () => {
      const pasted = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123&t=42s";

      const resolution = resolveVideoUrl(pasted);

      expect(resolution.ok).toBe(true);
      if (!resolution.ok) return;
      expect(resolution.source.url).toBe(pasted);

      const embed = adapterFor("YOUTUBE")!.embedUrl(resolution.source.reference, "https://manara.test");
      expect(embed).toContain("/embed/dQw4w9WgXcQ");
      expect(embed).not.toContain("list=PL123");
    });

    it("derives the thumbnail from the id", () => {
      const resolution = resolveVideoUrl("https://youtu.be/dQw4w9WgXcQ");

      expect(resolution.ok).toBe(true);
      if (!resolution.ok) return;
      expect(resolution.source.thumbnailUrl).toBe(
        "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      );
    });

    it.each([
      "https://youtube.com/watch?v=abc",
      "https://youtu.be/tooshort",
      "https://www.youtube.com/results?search_query=nahw",
    ])("refuses %s, which names no video", (url) => {
      expect(resolveVideoUrl(url)).toEqual({ ok: false, error: "NO_VIDEO_ID" });
    });
  });

  describe("Vimeo", () => {
    it.each([
      ["https://vimeo.com/76979871", "76979871"],
      ["https://www.vimeo.com/76979871", "76979871"],
      ["https://vimeo.com/76979871/", "76979871"],
      ["https://player.vimeo.com/video/76979871", "76979871"],
      ["https://vimeo.com/channels/staffpicks/76979871", "76979871"],
      ["https://vimeo.com/groups/motion/videos/76979871", "76979871"],
      ["https://vimeo.com/album/2222222/video/76979871", "76979871"],
      ["https://vimeo.com/showcase/2222222/video/76979871", "76979871"],
    ])("reads the video id out of %s", (url, expectedId) => {
      const resolution = resolveVideoUrl(url);

      expect(resolution.ok).toBe(true);
      if (!resolution.ok) return;
      expect(resolution.source.provider).toBe("VIMEO");
      expect(resolution.source.reference.externalId).toBe(expectedId);
    });

    /**
     * The reason an id alone is not enough: without the token an unlisted video's embed refuses to
     * play, and the failure looks like a working link showing nothing.
     */
    it.each([
      "https://vimeo.com/76979871/abc123def4",
      "https://vimeo.com/76979871?h=abc123def4",
      "https://player.vimeo.com/video/76979871?h=abc123def4",
    ])("keeps the unlisted-link token from %s and puts it back into the embed", (url) => {
      const resolution = resolveVideoUrl(url);

      expect(resolution.ok).toBe(true);
      if (!resolution.ok) return;
      expect(resolution.source.reference.privacyHash).toBe("abc123def4");

      const embed = adapterFor("VIMEO")!.embedUrl(resolution.source.reference, "https://manara.test");
      expect(embed).toContain("h=abc123def4");
    });

    it("has no thumbnail until the server has asked Vimeo for one", () => {
      const resolution = resolveVideoUrl("https://vimeo.com/76979871");

      expect(resolution.ok).toBe(true);
      if (!resolution.ok) return;
      expect(resolution.source.thumbnailUrl).toBeNull();
    });

    it.each(["https://vimeo.com/", "https://vimeo.com/channels/staffpicks", "https://vimeo.com/notanumber"])(
      "refuses %s, which names no video",
      (url) => {
        expect(resolveVideoUrl(url)).toEqual({ ok: false, error: "NO_VIDEO_ID" });
      },
    );
  });

  describe("refusals", () => {
    it.each(["", "   ", null, undefined])("reports an empty field for %s", (url) => {
      expect(resolveVideoUrl(url)).toEqual({ ok: false, error: "EMPTY" });
    });

    it.each([
      "not a url at all",
      "youtube.com/watch?v=dQw4w9WgXcQ",
      "/watch?v=dQw4w9WgXcQ",
      "javascript:alert(1)",
      "file:///etc/passwd",
    ])("refuses %s, which is not an absolute web address", (url) => {
      expect(resolveVideoUrl(url)).toEqual({ ok: false, error: "MALFORMED" });
    });

    it.each([
      "https://dailymotion.com/video/x8abcd",
      "https://wistia.com/medias/abc123",
      "https://example.com/lesson.mp4",
    ])("refuses %s, whose platform has no adapter", (url) => {
      expect(resolveVideoUrl(url)).toEqual({ ok: false, error: "UNSUPPORTED_PROVIDER" });
    });

    /** A domain that merely contains a provider's name belongs to whoever registered it. */
    it.each([
      "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ",
      "https://notyoutube.com/watch?v=dQw4w9WgXcQ",
      "https://vimeo.com.evil.example/76979871",
    ])("refuses the lookalike domain %s", (url) => {
      expect(resolveVideoUrl(url)).toEqual({ ok: false, error: "UNSUPPORTED_PROVIDER" });
    });
  });

  it("reports whether a URL is playable without throwing", () => {
    expect(isSupportedVideoUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(isSupportedVideoUrl("https://vimeo.com/76979871")).toBe(true);
    expect(isSupportedVideoUrl("https://example.com/video.mp4")).toBe(false);
  });
});

describe("videoSourceFromResponse", () => {
  /**
   * The backward-compatibility guarantee: a response carrying only the field the prototype sent
   * still produces a complete, playable video.
   */
  it("resolves a legacy response that carries only a videoUrl", () => {
    const source = videoSourceFromResponse({
      videoUrl: "https://www.youtube.com/watch?v=Jc__iOQgQNM",
    });

    expect(source?.provider).toBe("YOUTUBE");
    expect(source?.reference.externalId).toBe("Jc__iOQgQNM");
    expect(source?.thumbnailUrl).toBe("https://img.youtube.com/vi/Jc__iOQgQNM/hqdefault.jpg");
  });

  it("prefers the thumbnail the server resolved, which is the only one Vimeo has", () => {
    const source = videoSourceFromResponse({
      videoUrl: "https://vimeo.com/76979871",
      videoProvider: "VIMEO",
      externalVideoId: "76979871",
      videoThumbnailUrl: "https://i.vimeocdn.com/video/abc_640.jpg",
    });

    expect(source?.thumbnailUrl).toBe("https://i.vimeocdn.com/video/abc_640.jpg");
  });

  /** Keeps a lesson playable if a platform changes a URL shape before this client learns it. */
  it("falls back to the server's provider fields when the URL cannot be parsed", () => {
    const source = videoSourceFromResponse({
      videoUrl: "https://vimeo.com/some-shape-we-do-not-know",
      videoProvider: "VIMEO",
      externalVideoId: "76979871",
    });

    expect(source?.provider).toBe("VIMEO");
    expect(source?.reference.externalId).toBe("76979871");
  });

  it("is null for a locked lesson, which carries no video at all", () => {
    expect(videoSourceFromResponse({ videoUrl: null })).toBeNull();
    expect(videoSourceFromResponse(null)).toBeNull();
  });

  it("is null when neither the URL nor the fields can be read", () => {
    expect(videoSourceFromResponse({ videoUrl: "https://example.com/x.mp4" })).toBeNull();
  });
});
