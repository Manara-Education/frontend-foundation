export { VideoEmbed } from "./components/video-embed";
export { VideoThumbnail } from "./components/video-thumbnail";

export {
  VIDEO_PROVIDER_ADAPTERS,
  adapterFor,
  playbackEvent,
  vimeoAdapter,
  youTubeAdapter,
} from "./video.providers";
export type { VideoProviderAdapter } from "./video.providers";

export {
  isSupportedVideoUrl,
  resolveVideoSource,
  resolveVideoUrl,
  videoSourceFromResponse,
} from "./video.resolver";
export type { VideoResponseFields } from "./video.resolver";

export { VIDEO_PROVIDERS } from "./video.types";
export type {
  VideoPlaybackEvent,
  VideoPlaybackState,
  VideoProvider,
  VideoReference,
  VideoResolution,
  VideoResolutionError,
  VideoSource,
} from "./video.types";
