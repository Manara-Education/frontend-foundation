import type {
  VideoPlaybackEvent,
  VideoPlaybackState,
  VideoProvider,
  VideoReference,
} from "./video.types";

/**
 * Everything Manara knows about one video platform, and the only place it is allowed to know it.
 *
 * A new platform is a new object in `VIDEO_PROVIDER_ADAPTERS` below. Nothing else in the frontend
 * — no screen, no form, no player — has to be told about it.
 *
 * The shape deliberately mirrors the backend's `VideoProviderAdapter`, including the URL patterns
 * and the embed addresses, so a URL that the server accepts is a URL this can render and vice
 * versa. The two halves that only exist here are `playerOrigin` and the two message hooks: playing
 * an embed is a browser concern, so the postMessage protocol each platform speaks lives on this
 * side only.
 */
export interface VideoProviderAdapter {
  provider: VideoProvider;

  /** Whether this URL belongs to this platform, judged on host alone. */
  supports(url: URL): boolean;

  /** The video this URL names, or null when the host matches but the path names no video. */
  parse(url: URL): VideoReference | null;

  /** The tidy public address of this video. */
  canonicalUrl(reference: VideoReference): string;

  /**
   * The iframe address, including the player options this product wants.
   *
   * @param pageOrigin the page hosting the frame, which YouTube requires before it will talk back
   */
  embedUrl(reference: VideoReference, pageOrigin: string): string;

  /** A still image derivable from the id alone, or null when the platform has no such address. */
  thumbnailUrl(reference: VideoReference): string | null;

  /** The origin the embed is served from, and the only one its messages are accepted from. */
  playerOrigin: string;

  /**
   * What to send the frame so it starts reporting. Sent once the frame has loaded, and again if
   * the player announces itself ready afterwards — Vimeo only listens after that point, and
   * YouTube does not mind being told twice.
   */
  handshakeMessages(reference: VideoReference): unknown[];

  /**
   * The playback state this message reports, or null when it reports none.
   *
   * The caller has already checked that the message came from this player's own frame and origin,
   * so this only has to understand the payload.
   */
  readPlaybackState(data: unknown): VideoPlaybackState | null;
}

/** Parses a message that may arrive as a JSON string or as an already-decoded object. */
function decode(data: unknown): Record<string, unknown> | null {
  let decoded: unknown = data;
  if (typeof data === "string") {
    try {
      decoded = JSON.parse(data);
    } catch {
      // Both players also post plain strings that carry no state.
      return null;
    }
  }
  if (!decoded || typeof decoded !== "object") return null;
  return decoded as Record<string, unknown>;
}

const YOUTUBE_HOSTS = ["youtube.com", "youtu.be", "youtube-nocookie.com"];
const VIMEO_HOSTS = ["vimeo.com", "player.vimeo.com"];

/** The host with `www.`/`m.` removed, so lookalike domains cannot pass as a provider. */
function bareHost(url: URL): string {
  const host = url.hostname.toLowerCase();
  if (host.startsWith("www.")) return host.slice(4);
  if (host.startsWith("m.")) return host.slice(2);
  return host;
}

const YOUTUBE_ID = "([A-Za-z0-9_-]{11})";

/**
 * Every shape YouTube hands out. The first four are the ones the prototype accepted — in its two
 * separate copies of this list — and the rest are forms YouTube still issues.
 */
const YOUTUBE_PATTERNS = [
  new RegExp(`[?&]v=${YOUTUBE_ID}`),
  new RegExp(`^/${YOUTUBE_ID}$`),
  new RegExp(`^/embed/${YOUTUBE_ID}`),
  new RegExp(`^/shorts/${YOUTUBE_ID}`),
  new RegExp(`^/v/${YOUTUBE_ID}`),
  new RegExp(`^/live/${YOUTUBE_ID}`),
];

/** YouTube's own player states. */
const YOUTUBE_STATES: Record<number, VideoPlaybackState> = {
  [-1]: "ready",
  0: "ended",
  1: "playing",
  2: "paused",
  3: "loading",
  5: "ready",
};

export const youTubeAdapter: VideoProviderAdapter = {
  provider: "YOUTUBE",

  supports: (url) => YOUTUBE_HOSTS.includes(bareHost(url)),

  parse(url) {
    // youtu.be puts the id in the path and everything else in `v=` or a named segment, so both
    // halves of the URL are offered to the same list.
    const path = url.pathname;
    const query = url.search;

    for (const pattern of YOUTUBE_PATTERNS) {
      const onPath = path.match(pattern);
      if (onPath) return { externalId: onPath[1], privacyHash: null };

      const onQuery = query.match(pattern);
      if (onQuery) return { externalId: onQuery[1], privacyHash: null };
    }
    return null;
  },

  canonicalUrl: (reference) => `https://www.youtube.com/watch?v=${reference.externalId}`,

  /**
   * The player options are the prototype's, unchanged: no related videos, no branding, no
   * annotations or captions forced on, and the JS API enabled so the lesson can hear the video end.
   */
  embedUrl: (reference, pageOrigin) =>
    `https://www.youtube.com/embed/${reference.externalId}` +
    `?rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&enablejsapi=1` +
    `&origin=${encodeURIComponent(pageOrigin)}`,

  thumbnailUrl: (reference) => `https://img.youtube.com/vi/${reference.externalId}/hqdefault.jpg`,

  playerOrigin: "https://www.youtube.com",

  handshakeMessages: (reference) => [
    { event: "listening", id: reference.externalId, channel: "widget" },
    {
      event: "command",
      func: "addEventListener",
      args: ["onStateChange"],
      id: reference.externalId,
      channel: "widget",
    },
  ],

  readPlaybackState(data) {
    const message = decode(data);
    if (!message) return null;

    // The API answers a registered listener with `onStateChange`, and repeats the same state in
    // the `infoDelivery` ticks it sends while playing. Either is read; the caller collapses the
    // pair the two make of one transition.
    if (message.event === "onStateChange" && typeof message.info === "number") {
      return YOUTUBE_STATES[message.info] ?? null;
    }
    if (message.event === "infoDelivery" && message.info && typeof message.info === "object") {
      const state = (message.info as { playerState?: unknown }).playerState;
      if (typeof state === "number") return YOUTUBE_STATES[state] ?? null;
    }
    if (message.event === "onReady") return "ready";
    if (message.event === "onError") return "error";
    return null;
  },
};

const VIMEO_ID = "(\\d+)";
const VIMEO_HASH = "([A-Za-z0-9]+)";

/**
 * Where a video id can sit in a Vimeo path, most specific first. A Vimeo link is not one path
 * segment: the id can be under a channel, a group, an album, or on its own.
 */
const VIMEO_PATTERNS = [
  new RegExp(`^/video/${VIMEO_ID}(?:/${VIMEO_HASH})?`),
  new RegExp(`^/channels/[^/]+/${VIMEO_ID}(?:/${VIMEO_HASH})?`),
  new RegExp(`^/groups/[^/]+/videos/${VIMEO_ID}(?:/${VIMEO_HASH})?`),
  new RegExp(`^/(?:album|showcase)/[^/]+/video/${VIMEO_ID}(?:/${VIMEO_HASH})?`),
  new RegExp(`^/${VIMEO_ID}(?:/${VIMEO_HASH})?/?$`),
];

const VIMEO_STATES: Record<string, VideoPlaybackState> = {
  ready: "ready",
  play: "playing",
  playing: "playing",
  pause: "paused",
  ended: "ended",
  finish: "ended",
  error: "error",
};

export const vimeoAdapter: VideoProviderAdapter = {
  provider: "VIMEO",

  supports: (url) => VIMEO_HOSTS.includes(bareHost(url)),

  parse(url) {
    for (const pattern of VIMEO_PATTERNS) {
      const match = url.pathname.match(pattern);
      if (!match) continue;

      // A token in the path wins over one in the query: both name the same video, and the path
      // form is what Vimeo's own share dialog produces.
      const privacyHash = match[2] ?? url.searchParams.get("h");
      return { externalId: match[1], privacyHash: privacyHash || null };
    }
    return null;
  },

  canonicalUrl: (reference) =>
    reference.privacyHash
      ? `https://vimeo.com/${reference.externalId}/${reference.privacyHash}`
      : `https://vimeo.com/${reference.externalId}`,

  /**
   * The unlisted token goes back in, because without it Vimeo refuses to play the video in a
   * frame — the link would look right and show nothing.
   */
  embedUrl(reference) {
    const params = new URLSearchParams();
    if (reference.privacyHash) params.set("h", reference.privacyHash);
    // Vimeo's equivalents of the YouTube options above: no title/byline/portrait chrome.
    params.set("title", "0");
    params.set("byline", "0");
    params.set("portrait", "0");
    params.set("dnt", "1");
    return `https://player.vimeo.com/video/${reference.externalId}?${params.toString()}`;
  },

  /**
   * Null by design: Vimeo stills are addressed by content hash on a CDN, so there is nothing to
   * derive from an id. The backend fetches one and stores it on the lesson; until it has, callers
   * show their placeholder.
   */
  thumbnailUrl: () => null,

  playerOrigin: "https://player.vimeo.com",

  handshakeMessages: () => [
    { method: "addEventListener", value: "ready" },
    { method: "addEventListener", value: "play" },
    { method: "addEventListener", value: "pause" },
    { method: "addEventListener", value: "ended" },
    { method: "addEventListener", value: "error" },
  ],

  readPlaybackState(data) {
    const message = decode(data);
    if (!message) return null;
    if (typeof message.event !== "string") return null;
    return VIMEO_STATES[message.event] ?? null;
  },
};

/**
 * Every platform Manara can play. Order decides who is asked first; hosts do not overlap, so it
 * only matters for readability.
 */
export const VIDEO_PROVIDER_ADAPTERS: readonly VideoProviderAdapter[] = [youTubeAdapter, vimeoAdapter];

export function adapterFor(provider: VideoProvider): VideoProviderAdapter | null {
  return VIDEO_PROVIDER_ADAPTERS.find((adapter) => adapter.provider === provider) ?? null;
}

/** Wraps a state in the event shape lesson logic consumes. */
export function playbackEvent(
  provider: VideoProvider,
  state: VideoPlaybackState,
): VideoPlaybackEvent {
  return { provider, state };
}
