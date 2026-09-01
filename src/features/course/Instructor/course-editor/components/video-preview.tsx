import { motion } from "motion/react";
import { PlayCircle, Video } from "lucide-react";
import { VideoThumbnail, type VideoSource } from "@/shared/video";
import { formatVideoProviderLabel } from "../formatters/course-editor.formatter";

const FONT = "'Cairo', sans-serif";

interface VideoPreviewProps {
  source: VideoSource;
}

/**
 * What the instructor sees the moment a video URL resolves, on any supported platform.
 *
 * It shows the still and names the platform, so pasting a link gives immediate confirmation that
 * Manara understood it — and understood it as the platform the instructor meant.
 *
 * The still comes from the shared {@link VideoThumbnail}, which is the same component the lesson
 * cards use. A Vimeo video has no thumbnail address derivable from its URL, so a just-pasted Vimeo
 * link previews as the placeholder with its name on it until the lesson is saved and the server
 * has resolved one. That is expected, not a failure — the platform badge is what confirms the link
 * was read correctly.
 */
export function VideoPreview({ source }: VideoPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ duration: 0.22 }}
      className="relative overflow-hidden"
      style={{ borderRadius: 14, border: "1.5px solid rgba(78,91,146,0.12)", maxInlineSize: "100%", minInlineSize: 0 }}
    >
      <div
        style={{
          position: "relative",
          paddingBottom: "56.25%",
          background: "#0F1322",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <VideoThumbnail
          source={source}
          alt="معاينة الفيديو"
          fallback={
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #1a1f3c 0%, #2d3563 100%)" }}
            >
              <Video size={28} color="rgba(255,255,255,0.3)" />
              <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: FONT, fontSize: 12 }}>
                لا تتوفر معاينة
              </span>
            </div>
          }
        />

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="rounded-full flex items-center justify-center"
            style={{ width: 52, height: 52, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          >
            <PlayCircle size={28} color="#fff" />
          </div>
        </div>

        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }}
        />

        {/* The platform, read from the URL — the instructor's confirmation that it was understood. */}
        <div
          className="absolute bottom-2.5"
          dir="rtl"
          style={{ insetInlineStart: 12, fontFamily: FONT, fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}
        >
          {formatVideoProviderLabel(source.provider)}
        </div>
      </div>
    </motion.div>
  );
}
