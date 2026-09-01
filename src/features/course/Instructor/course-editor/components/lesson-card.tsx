import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowDown, ArrowUp, PlayCircle, Pencil, Trash2, GripVertical, FileText, Video } from "lucide-react";
import type { CourseLessonEditorState } from "@/shared/courses";
import { VideoThumbnail, videoSourceFromResponse } from "@/shared/video";
import { formatVideoProviderLabel } from "../formatters/course-editor.formatter";
import { FONT, PRIMARY, VIDEO_PROVIDER_BADGE } from "./editor-theme";

interface LessonCardProps {
  lesson: CourseLessonEditorState;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isDragging?: boolean;
}

export function LessonCard({
  lesson,
  index,
  onEdit,
  onDelete,
  canMoveUp = false,
  canMoveDown = false,
  onMoveUp,
  onMoveDown,
  isDragging,
}: LessonCardProps) {
  const [hovered, setHovered] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isRichContent = lesson.contentType === "RICH_CONTENT";

  // The lesson as the server described it: its own URL plus whatever still was resolved
  // for it. Vimeo lessons have one only after a save, which the fallback covers.
  //
  // Read only for a video lesson. A lesson switched to rich content keeps its URL in the editor's
  // state — that retention is what makes the switch reversible — and resolving it here would draw a
  // video thumbnail and a play icon on a card for an article.
  const videoSource = isRichContent
    ? null
    : videoSourceFromResponse({
        videoUrl: lesson.videoUrl,
        videoThumbnailUrl: lesson.videoThumbnailUrl,
      });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setConfirmDelete(false);
      }}
      style={{
        background: "#ffffff",
        borderRadius: 18,
        overflow: "hidden",
        border: `1.5px solid ${isDragging ? PRIMARY + "40" : hovered ? "rgba(78,91,146,0.18)" : "rgba(78,91,146,0.09)"}`,
        boxShadow: isDragging
          ? "0 16px 48px rgba(78,91,146,0.2)"
          : hovered
            ? "0 6px 24px rgba(78,91,146,0.1)"
            : "0 2px 8px rgba(78,91,146,0.05)",
        transition: "box-shadow 0.2s, border-color 0.2s",
        cursor: isDragging ? "grabbing" : "default",
        minInlineSize: 0,
        maxInlineSize: "100%",
      }}
    >
      <div dir="rtl" style={{ display: "flex", alignItems: "stretch", flexWrap: "wrap", minWidth: 0 }}>
        {/* Drag handle */}
        <div
          className="flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing rs-touch"
          style={{
            width: 44,
            minHeight: 44,
            background: hovered ? "rgba(78,91,146,0.03)" : "transparent",
            transition: "background 0.15s",
            touchAction: "none",
          }}
        >
          <GripVertical size={15} style={{ color: hovered ? "#9BA3C4" : "#D0D4E8", transition: "color 0.15s" }} />
        </div>

        {/* Number */}
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 36 }}>
          <div
            className="rounded-xl flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              background: "rgba(78,91,146,0.08)",
              color: PRIMARY,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {index + 1}
          </div>
        </div>

        {/* Thumbnail */}
        <div className="flex-shrink-0 flex items-center" style={{ paddingBlock: 12, paddingInlineEnd: 12 }}>
          {isRichContent ? (
            // A content lesson gets a card of its own rather than a black video frame with no
            // video in it. Same footprint, so a mixed curriculum still reads as one list.
            <div
              className="relative overflow-hidden flex items-center justify-center"
              style={{
                width: "clamp(72px, 24vw, 112px)",
                aspectRatio: "28 / 17",
                borderRadius: 12,
                background: "rgba(78,91,146,0.07)",
                border: "1px solid rgba(78,91,146,0.14)",
              }}
            >
              <FileText size={20} color={PRIMARY} strokeWidth={1.6} />
            </div>
          ) : (
            <div className="relative overflow-hidden" style={{ width: "clamp(72px, 24vw, 112px)", aspectRatio: "28 / 17", borderRadius: 12, background: "#0F1322" }}>
              <VideoThumbnail
                source={videoSource}
                alt={lesson.title}
                onLoadedChange={setThumbLoaded}
                fallback={
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #1a1f3c 0%, #2d3563 100%)" }}
                  >
                    <Video size={18} color="rgba(255,255,255,0.25)" />
                  </div>
                }
              />
              <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 30, height: 30, background: "rgba(0,0,0,0.5)", opacity: thumbLoaded ? 1 : 0, transition: "opacity 0.3s" }}
                >
                  <PlayCircle size={16} color="#fff" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div
          className="flex flex-col justify-center rs-longform"
          style={{ flex: "1 1 min(150px, 100%)", minWidth: 0, paddingBlock: 12, paddingInlineEnd: 8 }}
        >
          <div className="rs-longform" style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: "#1E2340", lineHeight: 1.4 }}>
            {lesson.title}
          </div>
          {lesson.description && (
            <div
              className="rs-longform"
              style={{
                fontFamily: FONT,
                fontSize: 12,
                color: "#9BA3C4",
                marginTop: 3,
                lineHeight: 1.5,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
              }}
            >
              {lesson.description}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap" style={{ minWidth: 0 }}>
            {/*
              A content lesson is badged for what it is, so an instructor scanning a mixed
              curriculum can tell the two kinds apart at a glance rather than by their absence.
            */}
            {isRichContent && (
              <div
                className="rounded-md px-2 py-0.5 flex items-center gap-1 rs-longform"
                style={{ background: "rgba(78,91,146,0.08)", minWidth: 0 }}
              >
                <FileText size={10} color={PRIMARY} />
                <span style={{ fontFamily: FONT, fontSize: 10, color: PRIMARY, fontWeight: 600 }}>
                  محتوى
                </span>
              </div>
            )}
            {/*
              The platform this lesson actually plays from, read from its own URL. A lesson whose
              link Manara cannot place shows no badge rather than claiming the wrong platform.
            */}
            {videoSource && (
              <div
                className="rounded-md px-2 py-0.5 flex items-center gap-1 rs-longform"
                style={{ background: VIDEO_PROVIDER_BADGE[videoSource.provider].background, minWidth: 0 }}
              >
                <PlayCircle size={10} color={VIDEO_PROVIDER_BADGE[videoSource.provider].color} />
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 10,
                    color: VIDEO_PROVIDER_BADGE[videoSource.provider].color,
                    fontWeight: 600,
                  }}
                >
                  {formatVideoProviderLabel(videoSource.provider)}
                </span>
              </div>
            )}
            {lesson.quiz && (
              <div className="rounded-md px-2 py-0.5 flex items-center gap-1 rs-longform" style={{ background: "rgba(78,91,146,0.08)", minWidth: 0 }}>
                <span style={{ fontFamily: FONT, fontSize: 10, color: PRIMARY, fontWeight: 600 }}>اختبار</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="rs-cluster"
          style={{
            "--rs-cluster-gap": "4px",
            padding: "10px 12px",
            flex: "0 1 auto",
            marginInlineStart: "auto",
            justifyContent: "flex-end",
          } as React.CSSProperties}
        >
          <AnimatePresence mode="wait">
            {confirmDelete ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="rs-cluster rounded-xl"
                style={{
                  "--rs-cluster-gap": "6px",
                  padding: "6px 8px",
                  background: "rgba(212,24,61,0.07)",
                  border: "1px solid rgba(212,24,61,0.15)",
                } as React.CSSProperties}
              >
                <span className="rs-longform" style={{ fontFamily: FONT, fontSize: 11.5, color: "#D4183D", fontWeight: 600 }}>حذف؟</span>
                <button
                  onClick={onDelete}
                  className="rounded-lg"
                  style={{ minWidth: 44, minHeight: 44, paddingInline: 10, background: "#D4183D", color: "#fff", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 11, fontWeight: 700 }}
                >
                  نعم
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg"
                  style={{ minWidth: 44, minHeight: 44, paddingInline: 10, background: "rgba(78,91,146,0.1)", color: PRIMARY, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 11, fontWeight: 600 }}
                >
                  لا
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="btns"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="rs-cluster"
                style={{ "--rs-cluster-gap": "4px" } as React.CSSProperties}
              >
                <button
                  onClick={onEdit}
                  title="تعديل الدرس"
                  aria-label="تعديل الدرس"
                  className="rounded-xl flex items-center justify-center"
                  style={{
                    width: 44,
                    height: 44,
                    background: hovered ? "rgba(78,91,146,0.08)" : "transparent",
                    color: hovered ? PRIMARY : "#C4C9DC",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(78,91,146,0.12)";
                    e.currentTarget.style.color = PRIMARY;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = hovered ? "rgba(78,91,146,0.08)" : "transparent";
                    e.currentTarget.style.color = hovered ? PRIMARY : "#C4C9DC";
                  }}
                >
                  <Pencil size={14} />
                </button>
                {onMoveUp && (
                  <button
                    onClick={onMoveUp}
                    disabled={!canMoveUp}
                    title="نقل الدرس لأعلى"
                    aria-label={`نقل الدرس ${index + 1} لأعلى`}
                    className="rounded-xl flex items-center justify-center"
                    style={{
                      width: 44,
                      height: 44,
                      background: "transparent",
                      color: canMoveUp ? "#9BA3C4" : "#D0D4E8",
                      border: "none",
                      cursor: canMoveUp ? "pointer" : "default",
                      opacity: canMoveUp ? 1 : 0.45,
                    }}
                  >
                    <ArrowUp size={14} />
                  </button>
                )}
                {onMoveDown && (
                  <button
                    onClick={onMoveDown}
                    disabled={!canMoveDown}
                    title="نقل الدرس لأسفل"
                    aria-label={`نقل الدرس ${index + 1} لأسفل`}
                    className="rounded-xl flex items-center justify-center"
                    style={{
                      width: 44,
                      height: 44,
                      background: "transparent",
                      color: canMoveDown ? "#9BA3C4" : "#D0D4E8",
                      border: "none",
                      cursor: canMoveDown ? "pointer" : "default",
                      opacity: canMoveDown ? 1 : 0.45,
                    }}
                  >
                    <ArrowDown size={14} />
                  </button>
                )}
                <button
                  onClick={() => setConfirmDelete(true)}
                  title="حذف الدرس"
                  aria-label="حذف الدرس"
                  className="rounded-xl flex items-center justify-center"
                  style={{ width: 44, height: 44, background: "transparent", color: "#C4C9DC", border: "none", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(212,24,61,0.08)";
                    e.currentTarget.style.color = "#D4183D";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#C4C9DC";
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
