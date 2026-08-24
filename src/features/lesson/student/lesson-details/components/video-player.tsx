import { CheckCircle2, Play, VideoOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { VideoEmbed, type VideoPlaybackEvent, type VideoSource } from "@/shared/video";
import { FONT } from "./lesson.constants";

interface VideoPlayerProps {
  /** The lesson's video, already resolved. Null when Manara cannot play what the lesson holds. */
  source: VideoSource | null;
  lessonTitle: string;
  /** Called once the video reports that it reached its end, whichever platform reported it. */
  onVideoEnd: () => void;
  isMarked: boolean;
  /** True while the lesson's quiz still stands between the learner and completion. */
  quizRequired?: boolean;
}

/** How long each transient flash stays on the bottom bar. */
const COMPLETION_FLASH_MS = 2500;
const WATCHED_FLASH_MS = 2800;

/**
 * The lesson's video player.
 *
 * Every platform-specific concern — the embed address, the handshake, the message protocol — sits
 * behind {@link VideoEmbed}, so this file is about the lesson: the chrome around the video, the
 * status the learner reads, and turning "the video ended" into the lesson's completion. It is the
 * same chrome the prototype's YouTube-only player had; what changed is that it no longer knows or
 * cares who is hosting.
 *
 * The completion rule is unchanged and now applies identically to both platforms: the lesson
 * completes when the *video* says it ended, not when the learner finds a button.
 */
export function VideoPlayer({
  source,
  lessonTitle,
  onVideoEnd,
  isMarked,
  quizRequired = false,
}: VideoPlayerProps) {
  const [showCompletionFlash, setShowCompletionFlash] = useState(false);
  const [showWatchedFlash, setShowWatchedFlash] = useState(false);

  // Both flashes clear themselves on a timer; the handles are kept so an unmount in the
  // meantime — navigating to the next lesson — cannot land a state change on a gone component.
  const completionTimerRef = useRef<number | null>(null);
  const watchedTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (completionTimerRef.current !== null) window.clearTimeout(completionTimerRef.current);
      if (watchedTimerRef.current !== null) window.clearTimeout(watchedTimerRef.current);
    },
    [],
  );

  const endHandlerRef = useRef({ onVideoEnd, quizRequired });
  endHandlerRef.current = { onVideoEnd, quizRequired };

  /**
   * The one place playback turns into lesson progress.
   *
   * It reads a normalised event, so a Vimeo `ended` and a YouTube state `0` arrive here as the
   * same thing and take the same path into completion. Nothing below this line is provider-aware.
   */
  function handlePlaybackEvent(event: VideoPlaybackEvent) {
    if (event.state !== "ended") return;

    const { onVideoEnd: notifyEnd, quizRequired: gated } = endHandlerRef.current;
    notifyEnd();

    // A gated lesson stops here: the video is watched, the quiz still owes an answer, and the
    // amber flash says so. The green one only follows a real completion.
    if (gated) {
      setShowWatchedFlash(true);
      if (watchedTimerRef.current !== null) window.clearTimeout(watchedTimerRef.current);
      watchedTimerRef.current = window.setTimeout(() => setShowWatchedFlash(false), WATCHED_FLASH_MS);
    }
  }

  // The lesson turning complete is what raises the green flash — the server's answer, not the
  // click that asked for it.
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
        {/* 16:9 ratio frame wrapper */}
        <div style={{ position: "relative", paddingTop: "56.25%", background: "#0F1120" }}>
          {source ? (
            <VideoEmbed source={source} title={lessonTitle} onPlaybackEvent={handlePlaybackEvent} />
          ) : (
            /*
              A lesson whose video Manara cannot place — an unsupported platform, or a link saved
              before video URLs were validated. The lesson still opens, with its description, its
              quiz and its navigation intact; only the frame is replaced.
            */
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: "linear-gradient(135deg, #1a1f3c 0%, #2d3563 100%)", padding: 24 }}
            >
              <VideoOff size={30} color="rgba(255,255,255,0.35)" />
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  textAlign: "center",
                }}
              >
                لا يمكن تشغيل هذا الفيديو حالياً
              </span>
            </div>
          )}
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
            Status only. Completion is the video's to trigger, so there is nothing here to press —
            the chip reports where the lesson stands and the two flashes report what just happened.
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
