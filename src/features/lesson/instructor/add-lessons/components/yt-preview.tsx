import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PlayCircle, Video } from "lucide-react";
import { getYouTubeThumbnail } from "../formatters/add-lessons.formatter";

const FONT = "'Cairo', sans-serif";

interface YtPreviewProps {
  videoId: string;
}

export function YtPreview({ videoId }: YtPreviewProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [videoId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ duration: 0.22 }}
      className="relative overflow-hidden"
      style={{ borderRadius: 14, border: "1.5px solid rgba(78,91,146,0.12)" }}
    >
      <div style={{ position: "relative", paddingBottom: "56.25%", background: "#0F1322", borderRadius: 14, overflow: "hidden" }}>
        {!failed ? (
          <>
            {!loaded && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1a1f3c 0%, #2d3563 100%)" }}
              >
                <div style={{ color: "rgba(255,255,255,0.25)", fontFamily: FONT, fontSize: 13 }}>جارٍ التحميل...</div>
              </div>
            )}
            <img
              src={getYouTubeThumbnail(videoId)}
              alt="معاينة الفيديو"
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: loaded ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            />
            {loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 52, height: 52, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
                >
                  <PlayCircle size={28} color="#fff" />
                </div>
              </div>
            )}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.45) 100%)" }} />
            <div className="absolute bottom-2.5 right-3" style={{ fontFamily: FONT, fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              YouTube
            </div>
          </>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #1a1f3c 0%, #2d3563 100%)" }}
          >
            <Video size={28} color="rgba(255,255,255,0.3)" />
            <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: FONT, fontSize: 12 }}>لا تتوفر معاينة</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
