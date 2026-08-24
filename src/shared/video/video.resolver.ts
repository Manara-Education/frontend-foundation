import { VIDEO_PROVIDER_ADAPTERS, adapterFor } from "./video.providers";
import type { VideoProvider, VideoResolution, VideoSource } from "./video.types";

/**
 * The one place a URL becomes a video, on this side of the wire.
 *
 * Screens do not parse video URLs. The lesson form asks this what the instructor typed is, the
 * player asks this what a saved lesson holds, and the preview and the card ask it for a thumbnail
 * — so all four agree by construction. The prototype had this logic twice, in the course editor's
 * formatter and inside the player component, which is exactly the drift this removes.
 *
 * It deliberately mirrors the backend resolver, down to the URL patterns. The client still needs
 * its own copy because an instructor gets an answer about a URL *before* it is saved; the server
 * remains the authority for anything that is stored.
 */

/** Understands a URL, or says why it cannot. Never throws. */
export function resolveVideoUrl(rawUrl: string | null | undefined): VideoResolution {
  if (rawUrl == null || rawUrl.trim() === "") {
    return { ok: false, error: "EMPTY" };
  }
  const url = rawUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: "MALFORMED" };
  }
  // Only absolute web addresses are videos. This is also what keeps a `javascript:` payload from
  // ever reaching something that would put it in an iframe.
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "MALFORMED" };
  }

  const adapter = VIDEO_PROVIDER_ADAPTERS.find((candidate) => candidate.supports(parsed));
  if (!adapter) {
    return { ok: false, error: "UNSUPPORTED_PROVIDER" };
  }

  const reference = adapter.parse(parsed);
  if (!reference) {
    return { ok: false, error: "NO_VIDEO_ID" };
  }

  return {
    ok: true,
    source: {
      provider: adapter.provider,
      url,
      reference,
      canonicalUrl: adapter.canonicalUrl(reference),
      thumbnailUrl: adapter.thumbnailUrl(reference),
    },
  };
}

/** The video, or null. For callers that have nothing to say about the reason. */
export function resolveVideoSource(rawUrl: string | null | undefined): VideoSource | null {
  const resolution = resolveVideoUrl(rawUrl);
  return resolution.ok ? resolution.source : null;
}

export function isSupportedVideoUrl(rawUrl: string | null | undefined): boolean {
  return resolveVideoUrl(rawUrl).ok;
}

/** The video fields a lesson response carries. Every one of them is optional on the wire. */
export interface VideoResponseFields {
  videoUrl?: string | null;
  videoProvider?: VideoProvider | null;
  externalVideoId?: string | null;
  videoThumbnailUrl?: string | null;
}

/**
 * The video a lesson response describes.
 *
 * The URL is read first, exactly as the server does, so a response from a build that predates the
 * provider fields — or a cached one — still produces a complete video. The server's fields are the
 * fallback for a URL this client cannot parse, which keeps a lesson playable even if a platform
 * changes a URL shape before the frontend learns about it.
 *
 * A stored thumbnail always wins where there is one, because Vimeo has no derivable address and
 * the server had to fetch it.
 */
export function videoSourceFromResponse(lesson: VideoResponseFields | null | undefined): VideoSource | null {
  if (!lesson) return null;

  const fromUrl = resolveVideoSource(lesson.videoUrl);
  if (fromUrl) {
    return lesson.videoThumbnailUrl
      ? { ...fromUrl, thumbnailUrl: lesson.videoThumbnailUrl }
      : fromUrl;
  }

  if (!lesson.videoProvider || !lesson.externalVideoId || !lesson.videoUrl) return null;

  const adapter = adapterFor(lesson.videoProvider);
  if (!adapter) return null;

  const reference = { externalId: lesson.externalVideoId, privacyHash: null };
  return {
    provider: adapter.provider,
    url: lesson.videoUrl,
    reference,
    canonicalUrl: adapter.canonicalUrl(reference),
    thumbnailUrl: lesson.videoThumbnailUrl ?? adapter.thumbnailUrl(reference),
  };
}
