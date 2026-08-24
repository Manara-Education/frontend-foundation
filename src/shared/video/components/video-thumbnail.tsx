import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { VideoSource } from "../video.types";

interface VideoThumbnailProps {
  source: VideoSource | null;
  alt: string;
  style?: CSSProperties;
  /** Shown while the image loads, and instead of it when there is none to show. */
  fallback: ReactNode;
  onLoadedChange?: (loaded: boolean) => void;
}

/**
 * A video's still image, asked for without knowing who makes it.
 *
 * Callers ask for `source` and get a picture or a fallback. They never build a thumbnail address,
 * which is what the prototype did in two places with a hardcoded `img.youtube.com` URL.
 *
 * The fallback is not an edge case. A Vimeo video has no thumbnail address derivable from its id,
 * so a freshly added Vimeo lesson shows the fallback until the server has fetched one and the next
 * response carries it. A YouTube video always has one immediately.
 */
export function VideoThumbnail({
  source,
  alt,
  style,
  fallback,
  onLoadedChange,
}: VideoThumbnailProps) {
  const thumbnailUrl = source?.thumbnailUrl ?? null;
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // A new video starts over: the previous still must not linger under the new lesson's title.
  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    onLoadedChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbnailUrl]);

  const showFallback = !thumbnailUrl || failed || !loaded;

  return (
    <>
      {thumbnailUrl && !failed && (
        <img
          src={thumbnailUrl}
          alt={alt}
          onLoad={() => {
            setLoaded(true);
            onLoadedChange?.(true);
          }}
          // A deleted or restricted video answers with an error rather than a picture. That is a
          // fact about the video, not a broken page: the fallback simply stays.
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s",
            ...style,
          }}
        />
      )}
      {showFallback && fallback}
    </>
  );
}
