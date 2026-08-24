import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PlayCircle, Link2, AlignLeft, BookOpen, CheckCircle, X } from "lucide-react";
import type { CourseLessonEditorState, QuizEditorState } from "@/shared/courses";
import { resolveVideoUrl, type VideoSource } from "@/shared/video";
import { formatVideoUrlError } from "../formatters/course-editor.formatter";
import type { LessonDraft } from "../types/course-editor.types";
import { QuizBuilder } from "./quiz-builder";
import { VideoPreview } from "./video-preview";
import { FONT, PRIMARY } from "./editor-theme";

interface LessonFormErrors {
  title?: string;
  url?: string;
}

interface LessonFormProps {
  initial?: CourseLessonEditorState;
  lessonNumber: number;
  onSave: (data: LessonDraft) => void;
  onCancel: () => void;
}

/**
 * The inline lesson editor, used by every content surface: the create wizard, the
 * course editor's content tab, and both of those in their module variants.
 *
 * The lesson's quiz is authored right here through the shared {@link QuizBuilder} and
 * travels back with the draft, so nothing about a lesson is saved on its own.
 */
export function LessonForm({ initial, lessonNumber, onSave, onCancel }: LessonFormProps) {
  const [lessonTitle, setLessonTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  // The video the URL currently resolves to, on whichever platform. Null while the field is empty
  // or holds something Manara cannot play — the two cases the error below tells apart.
  const [video, setVideo] = useState<VideoSource | null>(() => {
    if (!initial?.videoUrl) return null;
    const resolution = resolveVideoUrl(initial.videoUrl);
    return resolution.ok
      ? { ...resolution.source, thumbnailUrl: initial.videoThumbnailUrl ?? resolution.source.thumbnailUrl }
      : null;
  });
  const [quiz, setQuiz] = useState<QuizEditorState | null>(initial?.quiz ?? null);
  const [errors, setErrors] = useState<LessonFormErrors>({});
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  /*
    Debounced resolution of whatever has been typed. The instructor finds out which platform the
    link belongs to — and whether it is one Manara can play — without waiting for a save, and the
    answer comes from the same resolver the student player will use on it later.
  */
  useEffect(() => {
    const timer = setTimeout(() => {
      const resolution = resolveVideoUrl(videoUrl);

      if (resolution.ok) {
        // A stored still only belongs to the URL it was resolved for.
        const isUnchanged = videoUrl.trim() === (initial?.videoUrl ?? "").trim();
        setVideo({
          ...resolution.source,
          thumbnailUrl: isUnchanged
            ? (initial?.videoThumbnailUrl ?? resolution.source.thumbnailUrl)
            : resolution.source.thumbnailUrl,
        });
        setErrors((prev) => ({ ...prev, url: undefined }));
        return;
      }

      setVideo(null);
      // An empty field is not yet an error — it becomes one on save.
      setErrors((prev) => ({
        ...prev,
        url: resolution.error === "EMPTY" ? undefined : formatVideoUrlError(resolution.error),
      }));
    }, 400);
    return () => clearTimeout(timer);
  }, [videoUrl, initial?.videoUrl, initial?.videoThumbnailUrl]);

  const handleSave = () => {
    const e: LessonFormErrors = {};
    if (!lessonTitle.trim()) e.title = "يرجى إدخال عنوان الدرس";

    // Re-resolved rather than trusting the debounced state: saving before the timer has fired
    // would otherwise let an unresolved URL through.
    const resolution = resolveVideoUrl(videoUrl);
    if (!resolution.ok) e.url = formatVideoUrlError(resolution.error);

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    onSave({
      title: lessonTitle.trim(),
      description: description.trim(),
      // The URL as typed. The server derives the platform from it — the client never sends one.
      videoUrl: videoUrl.trim(),
      quiz,
    });
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    borderRadius: 13,
    border: "1.5px solid rgba(78,91,146,0.16)",
    background: "#FAFBFD",
    fontFamily: FONT,
    fontSize: 14,
    color: "#1E2340",
    outline: "none",
    transition: "border-color 0.18s, box-shadow 0.18s",
    boxSizing: "border-box",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        background: "#ffffff",
        borderRadius: 22,
        border: `1.5px solid ${PRIMARY}28`,
        boxShadow: `0 0 0 4px ${PRIMARY}08, 0 8px 32px rgba(78,91,146,0.1)`,
        padding: "28px 28px 24px",
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6" dir="rtl">
        <div
          className="rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ width: 38, height: 38, background: "rgba(78,91,146,0.1)", color: PRIMARY }}
        >
          <span style={{ fontWeight: 700, fontSize: 15 }}>{lessonNumber}</span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1E2340", fontFamily: FONT }}>
            {initial ? "تعديل الدرس" : "درس جديد"}
          </div>
          <div style={{ fontSize: 12, color: "#9BA3C4", fontFamily: FONT }}>
            أدخل تفاصيل الدرس وأضف رابط الفيديو
          </div>
        </div>
        <button
          onClick={onCancel}
          className="mr-auto rounded-xl flex items-center justify-center transition-colors"
          style={{ width: 34, height: 34, background: "rgba(78,91,146,0.06)", border: "none", cursor: "pointer", color: "#9BA3C4" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(212,24,61,0.08)";
            e.currentTarget.style.color = "#D4183D";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(78,91,146,0.06)";
            e.currentTarget.style.color = "#9BA3C4";
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-5" dir="rtl">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label
            style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340", display: "flex", alignItems: "center", gap: 4 }}
          >
            <BookOpen size={13} style={{ color: PRIMARY }} />
            عنوان الدرس
            <span style={{ color: "#D4183D" }}>*</span>
          </label>
          <input
            ref={titleRef}
            type="text"
            value={lessonTitle}
            onChange={(e) => {
              setLessonTitle(e.target.value);
              setErrors((p) => ({ ...p, title: undefined }));
            }}
            placeholder="مثال: مقدمة في البرمجة"
            style={{
              ...inputBase,
              height: 48,
              paddingRight: 14,
              paddingLeft: 14,
              border: `1.5px solid ${errors.title ? "#D4183D" : lessonTitle ? PRIMARY : "rgba(78,91,146,0.16)"}`,
              boxShadow: errors.title
                ? "0 0 0 3px rgba(212,24,61,0.07)"
                : lessonTitle
                  ? "0 0 0 3px rgba(78,91,146,0.08)"
                  : "none",
            }}
            onFocus={(e) => {
              if (!errors.title) {
                e.currentTarget.style.borderColor = PRIMARY;
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.1)";
              }
            }}
            onBlur={(e) => {
              if (!errors.title && !lessonTitle) {
                e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          />
          <AnimatePresence>
            {errors.title && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{ fontFamily: FONT, fontSize: 12, color: "#D4183D" }}
              >
                {errors.title}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label
            style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340", display: "flex", alignItems: "center", gap: 4 }}
          >
            <AlignLeft size={13} style={{ color: "#9BA3C4" }} />
            وصف الدرس
            <span style={{ fontSize: 11, color: "#B0B7D4", fontWeight: 400 }}>(اختياري)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف مختصر لما سيتعلمه الطالب في هذا الدرس..."
            rows={2}
            style={{ ...inputBase, padding: "12px 14px", resize: "vertical" as const, minHeight: 70, lineHeight: 1.75 }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = PRIMARY;
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.08)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Video URL — any supported platform */}
        <div className="flex flex-col gap-1.5">
          <label
            style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340", display: "flex", alignItems: "center", gap: 4 }}
          >
            <PlayCircle size={13} style={{ color: "#FF0000" }} />
            رابط الفيديو
            <span style={{ color: "#D4183D" }}>*</span>
          </label>
          <div className="relative">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=...  أو  https://vimeo.com/..."
              dir="ltr"
              style={{
                ...inputBase,
                height: 48,
                paddingRight: 14,
                paddingLeft: video && !errors.url ? 44 : 14,
                textAlign: "left",
                border: `1.5px solid ${errors.url ? "#D4183D" : video ? "#27AE60" : videoUrl ? PRIMARY : "rgba(78,91,146,0.16)"}`,
                boxShadow: errors.url
                  ? "0 0 0 3px rgba(212,24,61,0.07)"
                  : video
                    ? "0 0 0 3px rgba(39,174,96,0.1)"
                    : videoUrl
                      ? "0 0 0 3px rgba(78,91,146,0.08)"
                      : "none",
              }}
              onFocus={(e) => {
                if (!errors.url) {
                  e.currentTarget.style.borderColor = PRIMARY;
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.08)";
                }
              }}
              onBlur={(e) => {
                if (!errors.url && !video) {
                  e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            />
            <div className="absolute top-1/2 left-3 flex items-center justify-center" style={{ transform: "translateY(-50%)" }}>
              <AnimatePresence mode="wait">
                {video && !errors.url ? (
                  <motion.div
                    key="ok"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    <CheckCircle size={16} color="#27AE60" />
                  </motion.div>
                ) : videoUrl && !video ? (
                  <motion.div key="link" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Link2 size={15} color="#9BA3C4" />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
          <AnimatePresence>
            {errors.url && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{ fontFamily: FONT, fontSize: 12, color: "#D4183D" }}
              >
                {errors.url}
              </motion.p>
            )}
          </AnimatePresence>
          <AnimatePresence>{video && !errors.url && <VideoPreview source={video} />}</AnimatePresence>
        </div>
      </div>

      {/* Quiz */}
      <div className="mt-6 pt-6" dir="rtl" style={{ borderTop: "1px solid rgba(78,91,146,0.08)" }}>
        <QuizBuilder quiz={quiz} onQuizChange={setQuiz} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6" dir="rtl">
        <motion.button
          onClick={handleSave}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.14 }}
          style={{
            height: 46,
            paddingLeft: 26,
            paddingRight: 26,
            borderRadius: 13,
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 4px 16px rgba(78,91,146,0.28)",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <CheckCircle size={15} /> حفظ الدرس
        </motion.button>
        <button
          onClick={onCancel}
          style={{
            height: 46,
            paddingLeft: 22,
            paddingRight: 22,
            borderRadius: 13,
            background: "transparent",
            color: "#717182",
            border: "1.5px solid rgba(78,91,146,0.16)",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 14,
            transition: "border-color 0.15s, color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget;
            b.style.borderColor = "rgba(78,91,146,0.3)";
            b.style.color = PRIMARY;
            b.style.background = "rgba(78,91,146,0.04)";
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget;
            b.style.borderColor = "rgba(78,91,146,0.16)";
            b.style.color = "#717182";
            b.style.background = "transparent";
          }}
        >
          إلغاء
        </button>
      </div>
    </motion.div>
  );
}
