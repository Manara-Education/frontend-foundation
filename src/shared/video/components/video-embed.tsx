import { useEffect, useRef } from "react";
import { adapterFor } from "../video.providers";
import type { VideoPlaybackEvent, VideoPlaybackState, VideoSource } from "../video.types";

interface VideoEmbedProps {
  source: VideoSource;
  /** Accessible name of the frame — the lesson's title, in practice. */
  title: string;
  /** Every state the player reports, already normalised. */
  onPlaybackEvent?: (event: VideoPlaybackEvent) => void;
}

/**
 * One video, playing, whoever hosts it.
 *
 * This is the only component in Manara that owns an iframe or listens to a player. It knows
 * nothing about either platform: the adapter for the source's provider supplies the embed address,
 * the handshake that makes the player start talking, and the translation from that platform's
 * messages into {@link VideoPlaybackState}. Adding a provider therefore does not touch this file.
 *
 * ## Why the message handling is careful
 *
 * `window.postMessage` can be sent by any frame, any extension, or the page itself. A message is
 * only believed when it came from *this* frame's own window **and** from the origin that frame was
 * served from. Without both checks any script on the page could announce that the video ended and
 * complete a lesson on the learner's behalf.
 */
export function VideoEmbed({ source, title, onPlaybackEvent }: VideoEmbedProps) {
  const adapter = adapterFor(source.provider);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Read through a ref so the listener is registered once per mount: re-subscribing on every
  // render would drop messages in the gap between removal and re-adding.
  const handlerRef = useRef(onPlaybackEvent);
  handlerRef.current = onPlaybackEvent;

  // The last state reported, so a repeat of the same one is not treated as a new event. Both
  // platforms report one transition more than once — YouTube in two message shapes, Vimeo when a
  // player re-announces itself — and lesson completion must fire once.
  const lastStateRef = useRef<VideoPlaybackState | null>(null);

  const embedUrl = adapter
    ? adapter.embedUrl(source.reference, window.location.origin)
    : "";

  /** Tells the frame we are listening. Safe to send more than once; both players expect it. */
  function sendHandshake() {
    const player = iframeRef.current?.contentWindow;
    if (!player || !adapter) return;

    for (const message of adapter.handshakeMessages(source.reference)) {
      player.postMessage(JSON.stringify(message), adapter.playerOrigin);
    }
  }

  useEffect(() => {
    if (!adapter) return;
    lastStateRef.current = null;

    function handleMessage(event: MessageEvent) {
      const player = iframeRef.current?.contentWindow;
      if (!player || event.source !== player) return;
      if (!adapter || event.origin !== adapter.playerOrigin) return;

      const state = adapter.readPlaybackState(event.data);
      if (state === null) return;

      // Vimeo only subscribes a listener once it has announced itself ready, and it may become
      // ready after the frame's load event. Re-sending here is what makes its `ended` arrive.
      if (state === "ready") sendHandshake();

      if (state === lastStateRef.current) return;
      lastStateRef.current = state;

      handlerRef.current?.({ provider: adapter.provider, state });
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // Re-subscribed when the video changes, so a new lesson starts from a clean state.
  }, [adapter, source.reference.externalId, source.reference.privacyHash]);

  if (!adapter) return null;

  return (
    <iframe
      ref={iframeRef}
      onLoad={sendHandshake}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: "none",
      }}
      src={embedUrl}
      title={title}
      /*
        The narrowest set both platforms need to play, go fullscreen, and support picture-in-
        picture. Nothing here grants the frame access to the page, and no permission is added
        merely to make one provider work.
      */
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
      // Neither platform needs to know which lesson page a learner is on.
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}
