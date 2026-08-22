import { CheckCircle2, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { FONT } from "./lesson.constants";

interface YouTubePlayerProps {
  videoUrl: string;
  lessonTitle: string;
  /** Called once the embedded video reports that it reached its end. */
  onVideoEnd: () => void;
  isMarked: boolean;
  /** True while the lesson's quiz still stands between the learner and completion. */
  quizRequired?: boolean;
}

const YT_ID_PATTERNS = [
  /(?:youtube\.com\/watch[?&]v=)([a-zA-Z0-9_-]{11})/,
  /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
];

function extractYouTubeId(url: string): string {
  for (const p of YT_ID_PATTERNS) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return "";
}

/** The origin the embed is served from, and the only one its messages are accepted from. */
const YT_ORIGIN = "https://www.youtube.com";

/** YouTube's own player states; `0` is `ENDED`. */
const YT_STATE_ENDED = 0;

/** How long each transient flash stays on the bottom bar. */
const COMPLETION_FLASH_MS = 2500;
const WATCHED_FLASH_MS = 2800;

/**
 * The player state this message reports, or `null` when it reports none.
 *
 * Both the origin and the sending window are checked first, so an unrelated
 * `window.postMessage` — from another frame, an extension, or the page itself — cannot
 * stand in for the player and complete the lesson.
 */
function readPlayerState(event: MessageEvent, player: Window | null | undefined): number | null {
  if (!player || event.source !== player) return null;
  if (event.origin !== YT_ORIGIN) return null;

  let data: unknown;
  try {
    data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
  } catch {
    // Not JSON: the embed also posts plain strings that carry no player state.
    return null;
  }
  if (!data || typeof data !== "object") return null;

  const message = data as { event?: unknown; info?: unknown };

  // The API answers a registered listener with `onStateChange`, and repeats the same
  // state inside the `infoDelivery` ticks it sends while playing. Either is read, and
  // the caller collapses the pair the two make of one transition.
  if (message.event === "onStateChange" && typeof message.info === "number") {
    return message.info;
  }
  if (message.event === "infoDelivery" && message.info && typeof message.info === "object") {
    const state = (message.info as { playerState?: unknown }).playerState;
    if (typeof state === "number") return state;
  }
  return null;
}

export function YouTubePlayer({
  videoUrl,
  lessonTitle,
  onVideoEnd,
  isMarked,
  quizRequired = false,
}: YouTubePlayerProps) {
  const videoId = extractYouTubeId(videoUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showCompletionFlash, setShowCompletionFlash] = useState(false);
  const [showWatchedFlash, setShowWatchedFlash] = useState(false);

  // Both flashes clear themselves on a timer; the handles are kept so an unmount in the
  // meantime — navigating to the next lesson — cannot land a state change on a gone
  // component.
  const completionTimerRef = useRef<number | null>(null);
  const watchedTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (completionTimerRef.current !== null) window.clearTimeout(completionTimerRef.current);
      if (watchedTimerRef.current !== null) window.clearTimeout(watchedTimerRef.current);
    },
    [],
  );

  // The callback and the quiz flag are read through a ref so the listener is registered
  // once per mount: re-subscribing on every render would drop messages in the gap.
  const endHandlerRef = useRef({ onVideoEnd, quizRequired });
  endHandlerRef.current = { onVideoEnd, quizRequired };

  // The last state the player reported, so a repeat of the same one is not a new event.
  const lastStateRef = useRef<number | null>(null);

  /**
   * The embed reports its state over `postMessage` once the page has said it is
   * listening. The lesson completes on the player's own end event rather than on a
   * button the learner has to find.
   */
  useEffect(() => {
    if (!videoId) return;
    lastStateRef.current = null;

    function handleMessage(event: MessageEvent) {
      const state = readPlayerState(event, iframeRef.current?.contentWindow);
      if (state === null) return;

      // One end of the video is reported twice, once in each message shape, so what is
      // acted on is the move *into* the ended state. A replay that ends again passes
      // through the other states first and is a new end of its own.
      const previousState = lastStateRef.current;
      lastStateRef.current = state;
      if (state !== YT_STATE_ENDED || previousState === YT_STATE_ENDED) return;

      const { onVideoEnd: notifyEnd, quizRequired: gated } = endHandlerRef.current;
      notifyEnd();

      // A gated lesson stops here: the video is watched, the quiz still owes an answer,
      // and the amber flash says so. The green one only follows a real completion.
      if (gated) {
        setShowWatchedFlash(true);
        if (watchedTimerRef.current !== null) window.clearTimeout(watchedTimerRef.current);
        watchedTimerRef.current = window.setTimeout(
          () => setShowWatchedFlash(false),
          WATCHED_FLASH_MS,
        );
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [videoId]);

  /**
   * The embed stays silent until the page registers with it, so the handshake is sent as
   * soon as the frame has loaded — and again whenever the frame reloads for a new video.
   */
  function handleIframeLoad() {
    const player = iframeRef.current?.contentWindow;
    if (!player) return;
    player.postMessage(
      JSON.stringify({ event: "listening", id: videoId, channel: "widget" }),
      YT_ORIGIN,
    );
    player.postMessage(
      JSON.stringify({
        event: "command",
        func: "addEventListener",
        args: ["onStateChange"],
        id: videoId,
        channel: "widget",
      }),
      YT_ORIGIN,
    );
  }

  // The lesson turning complete is what raises the green flash — the server's answer,
  // not the click that asked for it.
  const wasMarkedRef = useRef(isMarked);
  useEffect(() => {
    if (!wasMarkedRef.current && isMarked) {
      setShowCompletionFlash(true);
      if (completionTimerRef.current !== null) window.clearTimeout(completionTimerRef.current);
      completionTimerRef.current = window.setTimeout(
        () => setShowCompletionFlash(false),
        COMPLETION_FLASH_MS,
      );
    }
    wasMarkedRef.current = isMarked;
  }, [isMarked]);

  const statusLabel = isMarked
    ? "مكتمل"
    : quizRequired
      ? "اجتز الاختبار لإكمال الدرس"
      : "يكتمل تلقائياً عند انتهاء الفيديو";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      style={{ marginBottom: 16 }}
    >
      {/* Player container */}
      <div
        style={{
          borderRadius: 22,
          overflow: "hidden",
          background: "#0F1120",
          boxShadow: "0 8px 48px rgba(10,13,40,0.22), 0 2px 12px rgba(78,91,146,0.12)",
          position: "relative",
        }}
      >
        {/* 16:9 ratio iframe wrapper */}
        <div style={{ position: "relative", paddingTop: "56.25%", background: "#0F1120" }}>
          <iframe
            ref={iframeRef}
            onLoad={handleIframeLoad}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
            title={lessonTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Bottom bar */}
        <div
          style={{
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #0F1120 0%, #141828 100%)",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 9,
                background: "rgba(78,91,146,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Play size={12} fill="#7080B8" color="#7080B8" strokeWidth={0} />
            </div>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 12,
                color: "rgba(255,255,255,0.65)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {lessonTitle}
            </span>
          </div>

          {/*
            Status only. Completion is the video's to trigger, so there is nothing here to
            press — the chip reports where the lesson stands and the two flashes report
            what just happened.
          */}
          <AnimatePresence mode="wait">
            {showCompletionFlash ? (
              <motion.div
                key="flash-complete"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  fontFamily: FONT,
                  fontSize: 12,
                  color: "#4ADE80",
                }}
              >
                <CheckCircle2 size={14} strokeWidth={2} />
                اكتمل الدرس تلقائياً!
              </motion.div>
            ) : showWatchedFlash ? (
              <motion.div
                key="flash-watched"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: "rgba(234,179,8,0.15)",
                  border: "1px solid rgba(234,179,8,0.3)",
                  fontFamily: FONT,
                  fontSize: 12,
                  color: "#FCD34D",
                }}
              >
                <CheckCircle2 size={14} strokeWidth={2} />
                تمت المشاهدة — أكمل الاختبار
              </motion.div>
            ) : (
              <div
                key="status"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: isMarked
                    ? "rgba(34,197,94,0.12)"
                    : quizRequired
                      ? "rgba(234,179,8,0.12)"
                      : "rgba(78,91,146,0.18)",
                  border: `1px solid ${isMarked ? "rgba(34,197,94,0.25)" : quizRequired ? "rgba(234,179,8,0.28)" : "rgba(78,91,146,0.3)"}`,
                  fontFamily: FONT,
                  fontSize: 12,
                  color: isMarked ? "#4ADE80" : quizRequired ? "#FCD34D" : "rgba(255,255,255,0.75)",
                  flexShrink: 0,
                  maxWidth: 220,
                  textAlign: "center",
                  userSelect: "none",
                }}
              >
                <CheckCircle2 size={13} strokeWidth={2} />
                {statusLabel}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
