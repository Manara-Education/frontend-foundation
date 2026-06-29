import { CheckCircle2, Play, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { FONT, PRIMARY } from "./lesson.constants";

interface YouTubePlayerProps {
  videoUrl: string;
  lessonTitle: string;
  onMarkComplete: () => void;
  isMarked: boolean;
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

export function YouTubePlayer({
  videoUrl,
  lessonTitle,
  onMarkComplete,
  isMarked,
}: YouTubePlayerProps) {
  const videoId = extractYouTubeId(videoUrl);
  const [showCompletionFlash, setShowCompletionFlash] = useState(false);

  function handleMarkComplete() {
    if (isMarked) return;
    setShowCompletionFlash(true);
    setTimeout(() => setShowCompletionFlash(false), 2000);
    onMarkComplete();
  }

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
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0`}
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

          {/* Mark complete button */}
          <AnimatePresence mode="wait">
            {showCompletionFlash ? (
              <motion.div
                key="flash"
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
                تم تسجيل الإتمام!
              </motion.div>
            ) : (
              <motion.button
                key="btn"
                whileHover={{ scale: isMarked ? 1 : 1.03 }}
                whileTap={{ scale: isMarked ? 1 : 0.97 }}
                onClick={handleMarkComplete}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: isMarked
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(78,91,146,0.18)",
                  border: `1px solid ${isMarked ? "rgba(34,197,94,0.25)" : "rgba(78,91,146,0.3)"}`,
                  cursor: isMarked ? "default" : "pointer",
                  fontFamily: FONT,
                  fontSize: 12,
                  color: isMarked ? "#4ADE80" : "rgba(255,255,255,0.75)",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={13} strokeWidth={2} />
                {isMarked ? "مكتمل" : "وضع علامة اكتمال"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Manara branding strip below player */}
      <div
        style={{
          marginTop: 8,
          padding: "8px 16px",
          borderRadius: 12,
          background: "rgba(78,91,146,0.04)",
          border: "1px solid rgba(78,91,146,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Sparkles size={11} color={PRIMARY} strokeWidth={1.8} />
        <span style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4" }}>
          تُقدّم منارة هذا الدرس ضمن منهج متسلسل مدروس لضمان أفضل تجربة تعليمية
        </span>
      </div>
    </motion.div>
  );
}
