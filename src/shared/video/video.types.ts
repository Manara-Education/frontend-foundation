/**
 * The video domain, independent of who hosts the video.
 *
 * Everything in Manara that shows, plays or validates a video talks in these terms. The two
 * platforms live in `video.providers.ts` and nowhere else, so a screen never asks "is this
 * YouTube?" — it asks the resolver what the video is and hands the answer to a player.
 */

/** A platform Manara can play a lesson video from. Mirrors the backend enum of the same name. */
export type VideoProvider = "YOUTUBE" | "VIMEO";

export const VIDEO_PROVIDERS: readonly VideoProvider[] = ["YOUTUBE", "VIMEO"];

/**
 * What a provider's URL identifies: the video, plus the unlisted-link token where the platform
 * has that concept.
 *
 * `privacyHash` is Vimeo's. It is part of the address rather than a secret — it is already in the
 * URL the instructor pasted — and an unlisted video will not play in an embed without it.
 */
export interface VideoReference {
  externalId: string;
  privacyHash: string | null;
}

/**
 * A video Manara understands: enough to render a player, a thumbnail, or a link, with no further
 * parsing anywhere downstream.
 */
export interface VideoSource {
  provider: VideoProvider;
  /** The address as stored or as the instructor typed it. Never rewritten. */
  url: string;
  reference: VideoReference;
  /** The tidy public address of the same video. */
  canonicalUrl: string;
  /** Still image, when the provider exposes one Manara can name without asking it. */
  thumbnailUrl: string | null;
}

/**
 * Where playback stands, in terms neither platform owns.
 *
 * Lesson logic reads these; it never sees a YouTube state number or a Vimeo event name.
 */
export type VideoPlaybackState =
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "ended"
  | "error";

/**
 * One thing the player reported.
 *
 * Both platforms are normalised into this before anything in the lesson hears about it, which is
 * what lets a Vimeo video complete a lesson by exactly the route a YouTube video does.
 */
export interface VideoPlaybackEvent {
  state: VideoPlaybackState;
  provider: VideoProvider;
}

/** Why a video cannot be shown, when it cannot. */
export type VideoResolutionError =
  | "EMPTY"
  | "MALFORMED"
  | "UNSUPPORTED_PROVIDER"
  | "NO_VIDEO_ID";

export type VideoResolution =
  | { ok: true; source: VideoSource }
  | { ok: false; error: VideoResolutionError };
