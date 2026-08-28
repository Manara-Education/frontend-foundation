import { Suspense, lazy, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PlayCircle, Link2, AlignLeft, BookOpen, CheckCircle, FileText, X } from "lucide-react";
import type {
  CourseLessonEditorState,
  LessonContentType,
  QuizEditorState,
} from "@/shared/courses";
import { resolveVideoUrl, type VideoSource } from "@/shared/video";
import { formatVideoUrlError } from "../formatters/course-editor.formatter";
import type { LessonDraft } from "../types/course-editor.types";
import { isRichDocumentEmpty, parseRichDocument } from "@/shared/rich-content";
import { QuizBuilder } from "./quiz-builder";
import { VideoPreview } from "./video-preview";
import { FONT, PRIMARY } from "./editor-theme";

/**
 * The rich-content editor, fetched only when an instructor actually opens one.
 *
 * TipTap and ProseMirror are the largest dependency in the application and they are useful to
 * exactly one screen in one of its two modes. Loaded eagerly they would be in the bundle of every
 * instructor who only ever adds video lessons, and — because this form is imported across the
 * course editor — in a good deal else besides. Students never reach this module at all: the lesson
 * renderer they use has no dependencies.
 *
 * The emptiness check is deliberately *not* imported from here. It is needed on every save,
 * including a video lesson's, and importing it from the editor's module would pull the editor in
 * eagerly and undo the split — so it comes from the shared schema, which is where the rule lives
 * anyway.
 */
const RichContentEditor = lazy(() =>
  import("./rich-content-editor").then((module) => ({ default: module.RichContentEditor })),
);

/** Whether a stored document has anything a learner could read. */
function isRichContentEmpty(json: string | null): boolean {
  return isRichDocumentEmpty(parseRichDocument(json));
}

interface LessonFormErrors {
  title?: string;
  url?: string;
  richContent?: string;
}

/** The two kinds of lesson, as the instructor picks between them. */
const CONTENT_TYPES: { value: LessonContentType; label: string; hint: string; Icon: typeof PlayCircle }[] = [
  { value: "VIDEO", label: "فيديو", hint: "درس بمقطع فيديو من يوتيوب أو فيميو", Icon: PlayCircle },
  { value: "RICH_CONTENT", label: "محتوى", hint: "درس مكتوب بعناوين وقوائم وروابط وأزرار", Icon: FileText },
];

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

  /*
    The lesson's kind, and the two content branches held side by side.

    Both are kept in state whatever the type is, mirroring what the server does with the two
    columns: switching to content and back must return the instructor to the video they had, and
    switching to video and back must return them to the article. Nothing is discarded by a change of
    type — which is why the confirmation below asks about what will be *shown*, not about what will
    be lost.
  */
  const [contentType, setContentType] = useState<LessonContentType>(initial?.contentType ?? "VIDEO");
  const [richContent, setRichContent] = useState<string | null>(initial?.richContent ?? null);
  const [pendingType, setPendingType] = useState<LessonContentType | null>(null);

  const isVideo = contentType === "VIDEO";

  /**
   * Whether switching away from the current type would leave authored work behind.
   *
   * Retained rather than deleted, so this decides whether to *ask*, not whether to keep. An
   * instructor who has written half an article and clicks "Video" by accident should be stopped;
   * one who has typed nothing should not be interrupted.
   */
  function hasContentFor(type: LessonContentType): boolean {
    return type === "VIDEO" ? videoUrl.trim() !== "" : !isRichContentEmpty(richContent);
  }

  function requestTypeChange(next: LessonContentType) {
    if (next === contentType) return;
    if (hasContentFor(contentType)) {
      setPendingType(next);
      return;
    }
    applyTypeChange(next);
  }

  function applyTypeChange(next: LessonContentType) {
    setContentType(next);
    setPendingType(null);
    // The other branch's error is about a field that is no longer being asked for.
    setErrors((prev) => ({ ...prev, url: undefined, richContent: undefined }));
  }

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  /*
    Debounced resolution of whatever has been typed. The instructor finds out which platform the
    link belongs to — and whether it is one Manara can play — without waiting for a save, and the
    answer comes from the same resolver the student player will use on it later.
  */
  useEffect(() => {
    // A rich-content lesson is not asked for a video, so its retained URL is neither resolved nor
    // complained about. Without this the form would show a video error for a field it is not
    // showing.
    if (!isVideo) return;

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
  }, [videoUrl, isVideo, initial?.videoUrl, initial?.videoThumbnailUrl]);

  const handleSave = () => {
    const e: LessonFormErrors = {};
    if (!lessonTitle.trim()) e.title = "يرجى إدخال عنوان الدرس";

    // Only the branch this lesson uses is checked. Asking a content lesson for a video URL is the
    // assumption this whole feature exists to remove, and it would make the retained URL of a
    // switched lesson block its own save.
    if (isVideo) {
      // Re-resolved rather than trusting the debounced state: saving before the timer has fired
      // would otherwise let an unresolved URL through.
      const resolution = resolveVideoUrl(videoUrl);
      if (!resolution.ok) e.url = formatVideoUrlError(resolution.error);
    } else if (isRichContentEmpty(richContent)) {
      // The same judgement the server makes, so an empty lesson is refused here rather than after a
      // round trip. Formatting with no text in it is empty however much of it there is.
      e.richContent = "يرجى إضافة محتوى للدرس";
    }

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    onSave({
      title: lessonTitle.trim(),
      description: description.trim(),
      contentType,
      // Both branches travel; the mapper sends only the one matching the type, and the server keeps
      // whatever it already had in the other.
      videoUrl: videoUrl.trim(),
      richContent,
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
            {isVideo ? "أدخل تفاصيل الدرس وأضف رابط الفيديو" : "أدخل تفاصيل الدرس واكتب محتواه"}
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


        {/*
          Lesson type. An explicit choice, made before the content is authored, because it is what
          decides which editor is shown — and, on the student's side, whether there is a player at
          all. Nothing about it is inferred from whether a video URL happens to be filled in.
        */}
        <div className="flex flex-col gap-1.5">
          <label
            style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340", display: "flex", alignItems: "center", gap: 4 }}
          >
            نوع الدرس
            <span style={{ color: "#D4183D" }}>*</span>
          </label>
          <div
            role="radiogroup"
            aria-label="نوع الدرس"
            className="flex gap-2 flex-wrap"
          >
            {CONTENT_TYPES.map(({ value, label, hint, Icon }) => {
              const selected = contentType === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  title={hint}
                  onClick={() => requestTypeChange(value)}
                  style={{
                    flex: "1 1 180px",
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    minHeight: 52,
                    padding: "10px 14px",
                    borderRadius: 13,
                    cursor: "pointer",
                    textAlign: "start",
                    fontFamily: FONT,
                    background: selected ? "rgba(78,91,146,0.07)" : "#FAFBFD",
                    border: `1.5px solid ${selected ? PRIMARY : "rgba(78,91,146,0.16)"}`,
                    boxShadow: selected ? "0 0 0 3px rgba(78,91,146,0.08)" : "none",
                    transition: "border-color 0.18s, background 0.18s, box-shadow 0.18s",
                  }}
                >
                  <Icon size={17} style={{ color: selected ? PRIMARY : "#9BA3C4", flexShrink: 0 }} />
                  <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: selected ? PRIMARY : "#1E2340" }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 11, color: "#9BA3C4", lineHeight: 1.5 }}>{hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/*
            Asked before the switch, not after. The content is retained either way — switching back
            restores it — so this is about not surprising someone who clicked the wrong card, which
            is why it says the content will be hidden rather than deleted.
          */}
          <AnimatePresence>
            {pendingType && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                role="alertdialog"
                aria-label="تأكيد تغيير نوع الدرس"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 13,
                  background: "rgba(245,158,11,0.07)",
                  border: "1.5px solid rgba(245,158,11,0.3)",
                }}
              >
                <span style={{ fontFamily: FONT, fontSize: 12.5, color: "#92400E", flex: "1 1 220px", lineHeight: 1.7 }}>
                  {pendingType === "RICH_CONTENT"
                    ? "سيتم إخفاء فيديو الدرس واستبداله بالمحتوى المكتوب. يمكنك الرجوع لنوع الفيديو لاحقًا ولن يُفقد الرابط."
                    : "سيتم إخفاء المحتوى المكتوب واستبداله بالفيديو. يمكنك الرجوع لنوع المحتوى لاحقًا ولن يُفقد ما كتبته."}
                </span>
                <button
                  type="button"
                  onClick={() => applyTypeChange(pendingType)}
                  style={{
                    height: 36, padding: "0 16px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: PRIMARY, color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: 12.5,
                  }}
                >
                  متابعة
                </button>
                <button
                  type="button"
                  onClick={() => setPendingType(null)}
                  style={{
                    height: 36, padding: "0 16px", borderRadius: 10, cursor: "pointer",
                    background: "transparent", color: "#717182",
                    border: "1.5px solid rgba(78,91,146,0.16)", fontFamily: FONT, fontWeight: 600, fontSize: 12.5,
                  }}
                >
                  إلغاء
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/*
          Exactly one content editor is mounted, chosen by the lesson's type. A branch, not a
          hidden section: the editor that is not in use is not rendered at all, so there is no
          disabled video field on a content lesson and no empty editor on a video one.
        */}
        {isVideo ? (
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
        ) : (
          <div className="flex flex-col gap-1.5">
            <label
              style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340", display: "flex", alignItems: "center", gap: 4 }}
            >
              <FileText size={13} style={{ color: PRIMARY }} />
              محتوى الدرس
              <span style={{ color: "#D4183D" }}>*</span>
            </label>
            <Suspense
              fallback={
                <div
                  style={{
                    minHeight: 260,
                    borderRadius: 13,
                    border: "1.5px solid rgba(78,91,146,0.16)",
                    background: "#FAFBFD",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT,
                    fontSize: 13,
                    color: "#9BA3C4",
                  }}
                >
                  جارٍ تحميل المحرر…
                </div>
              }
            >
              <RichContentEditor
                value={richContent}
                invalid={!!errors.richContent}
                onChange={(json) => {
                  setRichContent(json);
                  setErrors((p) => ({ ...p, richContent: undefined }));
                }}
              />
            </Suspense>
            <AnimatePresence>
              {errors.richContent && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{ fontFamily: FONT, fontSize: 12, color: "#D4183D" }}
                >
                  {errors.richContent}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}
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
