import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import {
  PlayCircle,
  Plus,
  Pencil,
  Trash2,
  Link2,
  AlignLeft,
  BookOpen,
  CheckCircle,
  GripVertical,
  ChevronLeft,
  ArrowRight,
  Video,
  X,
  ImageIcon,
  FileText,
  Save,
  Upload,
} from "lucide-react";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

// ── YouTube helpers ────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  if (!url.trim()) return null;
  const patterns = [
    /(?:youtube\.com\/watch[?&]v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Lesson {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  videoId: string;
}

// ── Shimmer skeleton ───────────────────────────────────────────────────────────

const SHIMMER = `
  @keyframes alv-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .alv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 35%,#F4F5FB 50%,#EAECF5 65%,#EAECF5 100%);
    background-size: 600px 100%;
    animation: alv-shimmer 1.9s ease-in-out infinite;
  }
`;

function Sk({ w, h, r = 10 }: { w?: number | string; h: number | string; r?: number }) {
  return <div className="alv-sk" style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0 }} />;
}

function PageSkeleton({ courseTitle }: { courseTitle: string }) {
  return (
    <>
      <style>{SHIMMER}</style>
      {/* Course context */}
      <div className="rounded-2xl p-4 mb-7 flex items-center gap-3" style={{ background: "#fff", border: "1.5px solid rgba(78,91,146,0.09)" }}>
        <Sk w={40} h={40} r={12} />
        <div className="flex flex-col gap-1.5 flex-1">
          <Sk h={14} w={80} r={5} />
          <Sk h={18} w={200} r={7} />
        </div>
      </div>
      {/* Cards */}
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-4 rounded-2xl p-4 mb-3" style={{ background: "#fff", border: "1.5px solid rgba(78,91,146,0.09)" }}>
          <Sk w={100} h={70} r={12} />
          <div className="flex flex-col gap-2 flex-1">
            <Sk h={16} w="60%" r={7} />
            <Sk h={12} w="80%" r={5} />
          </div>
        </div>
      ))}
    </>
  );
}

// ── YouTube Preview ────────────────────────────────────────────────────────────

interface YtPreviewProps {
  videoId: string;
}

function YtPreview({ videoId }: YtPreviewProps) {
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
              src={getThumbnail(videoId)}
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

// ── Lesson Form ────────────────────────────────────────────────────────────────

interface LessonFormProps {
  initial?: Partial<Lesson>;
  lessonNumber: number;
  onSave: (data: Omit<Lesson, "id">) => void;
  onCancel: () => void;
}

function LessonForm({ initial = {}, lessonNumber, onSave, onCancel }: LessonFormProps) {
  const [lessonTitle, setLessonTitle] = useState(initial.title ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [ytUrl, setYtUrl] = useState(initial.youtubeUrl ?? "");
  const [videoId, setVideoId] = useState<string | null>(initial.videoId ?? null);
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Debounced YouTube URL parsing
  useEffect(() => {
    const t = setTimeout(() => {
      const id = extractYouTubeId(ytUrl);
      setVideoId(id);
      if (ytUrl && !id) {
        setErrors((p) => ({ ...p, url: "رابط YouTube غير صالح" }));
      } else {
        setErrors((p) => ({ ...p, url: undefined }));
      }
    }, 400);
    return () => clearTimeout(t);
  }, [ytUrl]);

  const handleSave = () => {
    const e: { title?: string; url?: string } = {};
    if (!lessonTitle.trim()) e.title = "يرجى إدخال عنوان الدرس";
    if (!ytUrl.trim()) e.url = "يرجى إدخال رابط الفيديو";
    else if (!videoId) e.url = "رابط YouTube غير صالح";
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave({ title: lessonTitle.trim(), description: description.trim(), youtubeUrl: ytUrl.trim(), videoId: videoId! });
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
      {/* Form header */}
      <div className="flex items-center gap-3 mb-6" dir="rtl">
        <div
          className="rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ width: 38, height: 38, background: `rgba(78,91,146,0.1)`, color: PRIMARY }}
        >
          <span style={{ fontWeight: 700, fontSize: 15 }}>{lessonNumber}</span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1E2340", fontFamily: FONT }}>
            {initial.id ? "تعديل الدرس" : "درس جديد"}
          </div>
          <div style={{ fontSize: 12, color: "#9BA3C4", fontFamily: FONT }}>
            أدخل تفاصيل الدرس وأضف رابط الفيديو
          </div>
        </div>
        <button
          onClick={onCancel}
          className="mr-auto rounded-xl flex items-center justify-center transition-colors"
          style={{ width: 34, height: 34, background: "rgba(78,91,146,0.06)", border: "none", cursor: "pointer", color: "#9BA3C4" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,24,61,0.08)"; e.currentTarget.style.color = "#D4183D"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(78,91,146,0.06)"; e.currentTarget.style.color = "#9BA3C4"; }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-5" dir="rtl">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340", display: "flex", alignItems: "center", gap: 4 }}>
            <BookOpen size={13} style={{ color: PRIMARY }} />
            عنوان الدرس
            <span style={{ color: "#D4183D" }}>*</span>
          </label>
          <div className="relative">
            <input
              ref={titleRef}
              type="text"
              value={lessonTitle}
              onChange={(e) => { setLessonTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })); }}
              placeholder="مثال: مقدمة في البرمجة"
              style={{
                ...inputBase,
                height: 48,
                paddingRight: 14,
                paddingLeft: 14,
                border: `1.5px solid ${errors.title ? "#D4183D" : lessonTitle ? PRIMARY : "rgba(78,91,146,0.16)"}`,
                boxShadow: errors.title ? "0 0 0 3px rgba(212,24,61,0.07)" : lessonTitle ? "0 0 0 3px rgba(78,91,146,0.08)" : "none",
              }}
              onFocus={(e) => { if (!errors.title) { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.1)"; } }}
              onBlur={(e) => { if (!errors.title && !lessonTitle) { e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)"; e.currentTarget.style.boxShadow = "none"; } }}
            />
          </div>
          <AnimatePresence>
            {errors.title && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                style={{ fontFamily: FONT, fontSize: 12, color: "#D4183D" }}>{errors.title}</motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340", display: "flex", alignItems: "center", gap: 4 }}>
            <AlignLeft size={13} style={{ color: "#9BA3C4" }} />
            وصف الدرس
            <span style={{ fontSize: 11, color: "#B0B7D4", fontWeight: 400 }}>(اختياري)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف مختصر لما سيتعلمه الطالب في هذا الدرس..."
            rows={2}
            style={{
              ...inputBase,
              padding: "12px 14px",
              resize: "vertical",
              minHeight: 70,
              lineHeight: 1.75,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.08)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {/* YouTube URL */}
        <div className="flex flex-col gap-1.5">
          <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340", display: "flex", alignItems: "center", gap: 4 }}>
            <PlayCircle size={13} style={{ color: "#FF0000" }} />
            رابط فيديو YouTube
            <span style={{ color: "#D4183D" }}>*</span>
          </label>
          <div className="relative">
            <input
              type="url"
              value={ytUrl}
              onChange={(e) => { setYtUrl(e.target.value); }}
              placeholder="https://youtube.com/watch?v=..."
              dir="ltr"
              style={{
                ...inputBase,
                height: 48,
                paddingRight: 14,
                paddingLeft: videoId && !errors.url ? 44 : 14,
                textAlign: "left",
                border: `1.5px solid ${errors.url ? "#D4183D" : videoId ? "#27AE60" : ytUrl ? PRIMARY : "rgba(78,91,146,0.16)"}`,
                boxShadow: errors.url ? "0 0 0 3px rgba(212,24,61,0.07)" : videoId ? "0 0 0 3px rgba(39,174,96,0.1)" : ytUrl ? "0 0 0 3px rgba(78,91,146,0.08)" : "none",
              }}
              onFocus={(e) => { if (!errors.url) { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.08)"; } }}
              onBlur={(e) => { if (!errors.url && !videoId) { e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)"; e.currentTarget.style.boxShadow = "none"; } }}
            />
            {/* Status icon */}
            <div className="absolute top-1/2 left-3 flex items-center justify-center" style={{ transform: "translateY(-50%)" }}>
              <AnimatePresence mode="wait">
                {videoId && !errors.url ? (
                  <motion.div key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
                    <CheckCircle size={16} color="#27AE60" />
                  </motion.div>
                ) : ytUrl && !videoId ? (
                  <motion.div key="link" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Link2 size={15} color="#9BA3C4" />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {errors.url && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                style={{ fontFamily: FONT, fontSize: 12, color: "#D4183D" }}>{errors.url}</motion.p>
            )}
          </AnimatePresence>

          {/* Live thumbnail preview */}
          <AnimatePresence>
            {videoId && !errors.url && (
              <YtPreview videoId={videoId} />
            )}
          </AnimatePresence>
        </div>
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
          <CheckCircle size={15} />
          حفظ الدرس
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
          onMouseEnter={(e) => { const b = e.currentTarget; b.style.borderColor = "rgba(78,91,146,0.3)"; b.style.color = PRIMARY; b.style.background = "rgba(78,91,146,0.04)"; }}
          onMouseLeave={(e) => { const b = e.currentTarget; b.style.borderColor = "rgba(78,91,146,0.16)"; b.style.color = "#717182"; b.style.background = "transparent"; }}
        >
          إلغاء
        </button>
      </div>
    </motion.div>
  );
}

// ── Lesson Card ────────────────────────────────────────────────────────────────

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

function LessonCard({ lesson, index, onEdit, onDelete, isDragging }: LessonCardProps) {
  const [hovered, setHovered] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
      style={{
        background: "#ffffff",
        borderRadius: 18,
        border: `1.5px solid ${isDragging ? PRIMARY + "40" : hovered ? "rgba(78,91,146,0.18)" : "rgba(78,91,146,0.09)"}`,
        boxShadow: isDragging
          ? "0 16px 48px rgba(78,91,146,0.2)"
          : hovered
          ? "0 6px 24px rgba(78,91,146,0.1)"
          : "0 2px 8px rgba(78,91,146,0.05)",
        transition: "box-shadow 0.2s, border-color 0.2s",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      <div className="flex items-stretch" dir="rtl">
        {/* Drag handle */}
        <div
          className="flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing"
          style={{ width: 36, background: hovered ? "rgba(78,91,146,0.03)" : "transparent", transition: "background 0.15s" }}
        >
          <GripVertical size={15} style={{ color: hovered ? "#9BA3C4" : "#D0D4E8", transition: "color 0.15s" }} />
        </div>

        {/* Lesson number */}
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40 }}>
          <div
            className="rounded-xl flex items-center justify-center"
            style={{ width: 28, height: 28, background: "rgba(78,91,146,0.08)", color: PRIMARY, fontFamily: FONT, fontWeight: 700, fontSize: 12 }}
          >
            {index + 1}
          </div>
        </div>

        {/* Thumbnail */}
        <div className="flex-shrink-0 flex items-center py-3 pl-3">
          <div
            className="relative overflow-hidden"
            style={{ width: 112, height: 68, borderRadius: 12, background: "#0F1322", flexShrink: 0 }}
          >
            <img
              src={getThumbnail(lesson.videoId)}
              alt={lesson.title}
              onLoad={() => setThumbLoaded(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: thumbLoaded ? 1 : 0, transition: "opacity 0.3s" }}
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
              <div
                className="rounded-full flex items-center justify-center"
                style={{ width: 30, height: 30, background: "rgba(0,0,0,0.5)", opacity: thumbLoaded ? 1 : 0, transition: "opacity 0.3s" }}
              >
                <PlayCircle size={16} color="#fff" />
              </div>
            </div>
            {!thumbLoaded && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1f3c 0%, #2d3563 100%)" }}>
                <Video size={18} color="rgba(255,255,255,0.25)" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center py-3 pr-2">
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: "#1E2340", lineHeight: 1.4 }}>
            {lesson.title}
          </div>
          {lesson.description && (
            <div
              style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", marginTop: 3, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}
            >
              {lesson.description}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="rounded-md px-2 py-0.5 flex items-center gap-1" style={{ background: "rgba(255,0,0,0.07)" }}>
              <PlayCircle size={10} color="#FF0000" />
              <span style={{ fontFamily: FONT, fontSize: 10, color: "#CC0000", fontWeight: 600 }}>YouTube</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 px-3 flex-shrink-0">
          <AnimatePresence mode="wait">
            {confirmDelete ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                style={{ background: "rgba(212,24,61,0.07)", border: "1px solid rgba(212,24,61,0.15)" }}
              >
                <span style={{ fontFamily: FONT, fontSize: 11.5, color: "#D4183D", fontWeight: 600 }}>حذف؟</span>
                <button
                  onClick={onDelete}
                  className="rounded-lg px-2 py-0.5 transition-colors"
                  style={{ background: "#D4183D", color: "#fff", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 11, fontWeight: 700 }}
                >
                  نعم
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg px-2 py-0.5 transition-colors"
                  style={{ background: "rgba(78,91,146,0.1)", color: PRIMARY, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 11, fontWeight: 600 }}
                >
                  لا
                </button>
              </motion.div>
            ) : (
              <motion.div key="btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="flex items-center gap-1">
                <button
                  onClick={onEdit}
                  title="تعديل"
                  className="rounded-xl flex items-center justify-center transition-all"
                  style={{ width: 34, height: 34, background: hovered ? "rgba(78,91,146,0.08)" : "transparent", color: hovered ? PRIMARY : "#C4C9DC", border: "none", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(78,91,146,0.12)"; e.currentTarget.style.color = PRIMARY; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = hovered ? "rgba(78,91,146,0.08)" : "transparent"; e.currentTarget.style.color = hovered ? PRIMARY : "#C4C9DC"; }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  title="حذف"
                  className="rounded-xl flex items-center justify-center transition-all"
                  style={{ width: 34, height: 34, background: "transparent", color: "#C4C9DC", border: "none", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,24,61,0.08)"; e.currentTarget.style.color = "#D4183D"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C4C9DC"; }}
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

// ── Edit Course Modal ──────────────────────────────────────────────────────────

interface EditCourseModalProps {
  title:       string;
  description: string;
  imageUrl:    string;
  onSave:      (data: { title: string; description: string; imageUrl: string }) => void;
  onClose:     () => void;
}

function EditCourseModal({ title, description, imageUrl, onSave, onClose }: EditCourseModalProps) {
  const [editTitle,  setEditTitle]   = useState(title);
  const [editDesc,   setEditDesc]    = useState(description);
  const [editImage,  setEditImage]   = useState(imageUrl);
  const [imgPreview, setImgPreview]  = useState(imageUrl);
  const [titleError, setTitleError]  = useState("");
  const [dragging,   setDragging]    = useState(false);
  const fileRef       = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleInputRef.current?.focus(); }, []);

  useEffect(() => {
    const t = setTimeout(() => setImgPreview(editImage), 500);
    return () => clearTimeout(t);
  }, [editImage]);

  const handleImageFile = (file: File | null) => {
    if (!file) { setEditImage(""); setImgPreview(""); return; }
    const url = URL.createObjectURL(file);
    setEditImage(url);
    setImgPreview(url);
  };

  const handleSave = () => {
    if (!editTitle.trim()) { setTitleError("يرجى إدخال عنوان الدورة"); return; }
    onSave({ title: editTitle.trim(), description: editDesc.trim(), imageUrl: editImage.trim() });
    onClose();
  };

  const inputBase: React.CSSProperties = {
    width: "100%", borderRadius: 13,
    border: "1.5px solid rgba(78,91,146,0.16)",
    background: "#FAFBFD", fontFamily: FONT,
    fontSize: 14, color: "#1E2340", outline: "none",
    transition: "border-color 0.18s, box-shadow 0.18s",
    boxSizing: "border-box",
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(14,18,42,0.45)",
          backdropFilter: "blur(6px)",
          zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px",
        }}
      >
        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
          style={{
            background: "#ffffff", borderRadius: 28,
            width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 32px 80px rgba(14,18,42,0.22), 0 0 0 1px rgba(78,91,146,0.1)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-6 pb-5"
            style={{ borderBottom: "1px solid rgba(78,91,146,0.08)" }}>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ width: 42, height: 42, background: "rgba(78,91,146,0.09)", color: PRIMARY }}>
                <Pencil size={18} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 17, color: "#1E2340" }}>
                  تعديل معلومات الدورة
                </div>
                <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", marginTop: 1 }}>
                  قم بتحديث العنوان والوصف وصورة الغلاف
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl flex items-center justify-center"
              style={{ width: 36, height: 36, background: "rgba(78,91,146,0.06)", border: "none", cursor: "pointer", color: "#9BA3C4", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,24,61,0.08)"; e.currentTarget.style.color = "#D4183D"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(78,91,146,0.06)"; e.currentTarget.style.color = "#9BA3C4"; }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-6 p-7">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340", display: "flex", alignItems: "center", gap: 5 }}>
                <BookOpen size={13} style={{ color: PRIMARY }} />
                عنوان الدورة
                <span style={{ color: "#D4183D" }}>*</span>
              </label>
              <input
                ref={titleInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => { setEditTitle(e.target.value); setTitleError(""); }}
                placeholder="أدخل عنوان الدورة..."
                style={{
                  ...inputBase, height: 50,
                  paddingRight: 14, paddingLeft: 14,
                  border: `1.5px solid ${titleError ? "#D4183D" : editTitle ? PRIMARY : "rgba(78,91,146,0.16)"}`,
                  boxShadow: titleError ? "0 0 0 3px rgba(212,24,61,0.07)" : editTitle ? "0 0 0 3px rgba(78,91,146,0.08)" : "none",
                }}
                onFocus={(e) => { if (!titleError) { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.09)"; } }}
                onBlur={(e)  => { if (!titleError && !editTitle) { e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)"; e.currentTarget.style.boxShadow = "none"; } }}
              />
              <AnimatePresence>
                {titleError && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ fontFamily: FONT, fontSize: 12, color: "#D4183D" }}>
                    {titleError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340", display: "flex", alignItems: "center", gap: 5 }}>
                <FileText size={13} style={{ color: "#9BA3C4" }} />
                وصف الدورة
                <span style={{ fontSize: 11, color: "#B0B7D4", fontWeight: 400 }}>(اختياري)</span>
              </label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="أضف وصفاً موجزاً للدورة وما سيتعلمه الطالب..."
                rows={3}
                style={{ ...inputBase, padding: "13px 14px", resize: "vertical", minHeight: 80, lineHeight: 1.75 }}
                onFocus={(e) => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.08)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            {/* Cover image URL */}
            <div className="flex flex-col gap-2">
              <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340", display: "flex", alignItems: "center", gap: 5 }}>
                <ImageIcon size={13} style={{ color: "#9BA3C4" }} />
                صورة الغلاف
                <span style={{ fontSize: 11, color: "#B0B7D4", fontWeight: 400 }}>(اختياري)</span>
              </label>

              {imgPreview ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.22 }}
                  className="relative overflow-hidden"
                  style={{ borderRadius: 16, height: 200 }}
                >
                  <img src={imgPreview} alt="معاينة الغلاف" className="w-full h-full object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(14,18,42,0.5) 100%)" }}
                  />
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between">
                    <span
                      className="rounded-xl px-3 py-1"
                      style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", color: "#fff", fontFamily: FONT, fontSize: 12, fontWeight: 600 }}
                    >
                      صورة الغلاف
                    </span>
                    <button
                      onClick={() => handleImageFile(null)}
                      className="rounded-full flex items-center justify-center"
                      style={{ width: 32, height: 32, background: "rgba(212,24,61,0.85)", color: "#fff", border: "none", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,24,61,1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(212,24,61,0.85)")}
                    >
                      <X size={15} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="flex flex-col items-center justify-center gap-3 cursor-pointer"
                  style={{
                    borderRadius: 16,
                    height: 160,
                    border: `2px dashed ${dragging ? PRIMARY : "rgba(78,91,146,0.22)"}`,
                    background: dragging ? "rgba(78,91,146,0.04)" : "rgba(78,91,146,0.02)",
                    transition: "border-color 0.18s, background 0.18s",
                  }}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith("image/")) handleImageFile(file);
                  }}
                  whileHover={{ scale: 1.005 }}
                  transition={{ duration: 0.15 }}
                >
                  <div
                    className="rounded-2xl flex items-center justify-center"
                    style={{ width: 48, height: 48, background: dragging ? "rgba(78,91,146,0.12)" : "rgba(78,91,146,0.07)", color: dragging ? PRIMARY : "#9BA3C4" }}
                  >
                    <ImageIcon size={22} />
                  </div>
                  <div className="flex flex-col items-center gap-1" style={{ fontFamily: FONT }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: dragging ? PRIMARY : "#1E2340" }}>
                      {dragging ? "أفلت الصورة هنا" : "ارفع صورة للدورة"}
                    </span>
                    <span style={{ fontSize: 11.5, color: "#9BA3C4" }}>
                      PNG، JPG، WEBP — حتى 5 ميغابايت
                    </span>
                  </div>
                  {!dragging && (
                    <div
                      className="flex items-center gap-1.5 rounded-xl px-4 py-1.5"
                      style={{ background: "rgba(78,91,146,0.08)", color: PRIMARY, fontFamily: FONT, fontWeight: 600, fontSize: 12 }}
                    >
                      <Upload size={13} />
                      تصفح الملفات
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-7 py-5"
            style={{ borderTop: "1px solid rgba(78,91,146,0.08)" }}>
            <motion.button
              onClick={handleSave}
              whileHover={{ y: -2, boxShadow: "0 10px 26px rgba(78,91,146,0.30)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.14 }}
              className="flex items-center gap-2 rounded-2xl px-6 py-3"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
                color: "#fff", border: "none", cursor: "pointer",
                fontFamily: FONT, fontWeight: 700, fontSize: 14,
                boxShadow: "0 4px 16px rgba(78,91,146,0.26)",
              }}
            >
              <Save size={15} strokeWidth={2} />
              حفظ التعديلات
            </motion.button>
            <button
              onClick={onClose}
              style={{
                height: 46, paddingLeft: 20, paddingRight: 20, borderRadius: 13,
                background: "transparent", color: "#717182",
                border: "1.5px solid rgba(78,91,146,0.16)",
                cursor: "pointer", fontFamily: FONT, fontWeight: 600, fontSize: 14, transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { const b = e.currentTarget; b.style.color = PRIMARY; b.style.borderColor = "rgba(78,91,146,0.3)"; b.style.background = "rgba(78,91,146,0.04)"; }}
              onMouseLeave={(e) => { const b = e.currentTarget; b.style.color = "#717182"; b.style.borderColor = "rgba(78,91,146,0.16)"; b.style.background = "transparent"; }}
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyLessons({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col items-center justify-center text-center py-16 px-8"
      style={{
        background: "#ffffff",
        borderRadius: 24,
        border: "1.5px dashed rgba(78,91,146,0.2)",
      }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
        className="rounded-3xl flex items-center justify-center mb-5"
        style={{ width: 72, height: 72, background: "rgba(78,91,146,0.08)" }}
      >
        <PlayCircle size={30} style={{ color: PRIMARY }} />
      </motion.div>
      <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 17, color: "#1E2340" }}>
        لم تقم بإضافة أي دروس بعد
      </h3>
      <p style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4", marginTop: 6, maxWidth: 300, lineHeight: 1.75 }}>
        ابدأ بإضافة درسك الأول وربطه بفيديو YouTube — يمكنك إضافة المزيد لاحقاً
      </p>
      <motion.button
        onClick={onAdd}
        whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(78,91,146,0.28)" }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-2 mt-7 rounded-2xl px-6 py-3"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 14,
          boxShadow: "0 4px 16px rgba(78,91,146,0.25)",
        }}
      >
        <Plus size={16} />
        إضافة درس جديد
      </motion.button>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface AddLessonsViewProps {
  courseTitle: string;
  onFinish: () => void;
}

export function AddLessonsView({ courseTitle, onFinish }: AddLessonsViewProps) {
  const [lessons,        setLessons]        = useState<Lesson[]>([]);
  const [showForm,       setShowForm]        = useState(false);
  const [editingId,      setEditingId]       = useState<string | null>(null);
  const [isLoading,      setIsLoading]       = useState(true);
  const [showCourseEdit, setShowCourseEdit]  = useState(false);

  // Local editable course info (initialised from prop)
  const [displayTitle, setDisplayTitle] = useState(courseTitle);
  const [displayDesc,  setDisplayDesc]  = useState("");
  const [displayImage, setDisplayImage] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleSave = useCallback((data: Omit<Lesson, "id">) => {
    if (editingId) {
      setLessons((prev) => prev.map((l) => l.id === editingId ? { ...l, ...data } : l));
      setEditingId(null);
    } else {
      const newLesson: Lesson = { id: `lesson-${Date.now()}`, ...data };
      setLessons((prev) => [...prev, newLesson]);
      setShowForm(false);
    }
  }, [editingId]);

  const handleDelete = useCallback((id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
    if (editingId === id) setEditingId(null);
  }, [editingId]);

  const handleEdit = useCallback((id: string) => {
    setShowForm(false);
    setEditingId(id);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
  }, []);

  const editingLesson = editingId ? lessons.find((l) => l.id === editingId) : null;

  if (isLoading) {
    return (
      <div dir="rtl" style={{ fontFamily: FONT }}>
        <PageSkeleton courseTitle={displayTitle} />
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>

      {/* ── EDIT COURSE MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCourseEdit && (
          <EditCourseModal
            title={displayTitle}
            description={displayDesc}
            imageUrl={displayImage}
            onSave={({ title, description, imageUrl }) => {
              setDisplayTitle(title);
              setDisplayDesc(description);
              setDisplayImage(imageUrl);
            }}
            onClose={() => setShowCourseEdit(false)}
          />
        )}
      </AnimatePresence>

      {/* ── COURSE CONTEXT BANNER ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="flex items-center gap-4 rounded-2xl p-4 mb-7"
        style={{
          background: "linear-gradient(135deg, rgba(78,91,146,0.07) 0%, rgba(97,114,172,0.05) 100%)",
          border: "1.5px solid rgba(78,91,146,0.12)",
        }}
      >
        {/* Thumbnail or icon */}
        <div className="rounded-2xl flex-shrink-0 overflow-hidden"
          style={{ width: 46, height: 46 }}>
          {displayImage ? (
            <img src={displayImage} alt={displayTitle}
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: "rgba(78,91,146,0.12)", color: PRIMARY }}>
              <BookOpen size={20} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: "#9BA3C4", letterSpacing: 0.5, textTransform: "uppercase" }}>
            الدورة الحالية
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: "#1E2340", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayTitle}
          </div>
          {displayDesc && (
            <div style={{ fontFamily: FONT, fontSize: 11.5, color: "#9BA3C4", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayDesc}
            </div>
          )}
        </div>

        {/* ── Edit course button ── */}
        <motion.button
          onClick={() => setShowCourseEdit(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          title="تعديل معلومات الدورة"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 flex-shrink-0"
          style={{
            background: "rgba(78,91,146,0.08)",
            border: "1.5px solid rgba(78,91,146,0.14)",
            color: PRIMARY, cursor: "pointer",
            fontFamily: FONT, fontWeight: 600, fontSize: 12,
          }}
        >
          <Pencil size={13} strokeWidth={2} />
          تعديل
        </motion.button>

        <div
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 flex-shrink-0"
          style={{ background: lessons.length > 0 ? "rgba(39,174,96,0.1)" : "rgba(78,91,146,0.08)" }}
        >
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: lessons.length > 0 ? "#27AE60" : PRIMARY }}>
            {lessons.length}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: lessons.length > 0 ? "#27AE60" : "#9BA3C4" }}>
            {lessons.length === 1 ? "درس" : "دروس"}
          </span>
        </div>
      </motion.div>

      {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.06 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 20, color: "#1E2340", lineHeight: 1.3 }}>
            محتوى الدورة
          </h1>
          <p style={{ fontSize: 13, color: "#717182", marginTop: 3 }}>
            {lessons.length === 0
              ? "أضف دروسك وارتبط كل درس بفيديو على YouTube"
              : `لديك ${lessons.length} ${lessons.length === 1 ? "درس" : "دروس"} — يمكنك إعادة الترتيب بالسحب`}
          </p>
        </div>
        {lessons.length > 0 && !showForm && !editingId && (
          <motion.button
            onClick={() => setShowForm(true)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="flex items-center gap-2 rounded-2xl px-4 py-2.5 flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 13,
              boxShadow: "0 4px 14px rgba(78,91,146,0.25)",
            }}
          >
            <Plus size={15} />
            إضافة درس
          </motion.button>
        )}
      </motion.div>

      {/* ── EMPTY STATE ──────────────────────────────────────────────────── */}
      {lessons.length === 0 && !showForm && (
        <EmptyLessons onAdd={() => setShowForm(true)} />
      )}

      {/* ── INLINE FORM (Add new) ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <LessonForm
            key="add-form"
            lessonNumber={lessons.length + 1}
            onSave={handleSave}
            onCancel={handleCancelForm}
          />
        )}
      </AnimatePresence>

      {/* ── LESSONS LIST ─────────────────────────────────────────────────── */}
      {lessons.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Reorder.Group
            axis="y"
            values={lessons}
            onReorder={setLessons}
            style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}
          >
            <AnimatePresence>
              {lessons.map((lesson, idx) => (
                <Reorder.Item
                  key={lesson.id}
                  value={lesson}
                  style={{ listStyle: "none" }}
                >
                  {/* Edit form inline */}
                  <AnimatePresence>
                    {editingId === lesson.id && editingLesson && (
                      <LessonForm
                        key={`edit-${lesson.id}`}
                        initial={editingLesson}
                        lessonNumber={idx + 1}
                        onSave={handleSave}
                        onCancel={handleCancelForm}
                      />
                    )}
                  </AnimatePresence>

                  {/* Card (hide while editing this lesson) */}
                  {editingId !== lesson.id && (
                    <LessonCard
                      lesson={lesson}
                      index={idx}
                      onEdit={() => handleEdit(lesson.id)}
                      onDelete={() => handleDelete(lesson.id)}
                    />
                  )}
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </motion.div>
      )}

      {/* ── ADD ANOTHER LESSON ───────────────────────────────────────────── */}
      {lessons.length > 0 && !showForm && !editingId && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          onClick={() => setShowForm(true)}
          whileHover={{ backgroundColor: "rgba(78,91,146,0.06)" }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl mt-3 py-4 transition-colors"
          style={{
            background: "transparent",
            border: "1.5px dashed rgba(78,91,146,0.22)",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 13.5,
            color: PRIMARY,
          }}
        >
          <Plus size={16} />
          إضافة درس جديد
        </motion.button>
      )}

      {/* ── FINISH SECTION ───────────────────────────────────────────────── */}
      {lessons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mt-10 flex flex-col gap-4"
        >
          {/* Divider */}
          <div style={{ height: 1, background: "rgba(78,91,146,0.08)" }} />

          {/* Summary */}
          <div className="flex items-center gap-3 rounded-2xl p-4"
            style={{ background: "rgba(39,174,96,0.06)", border: "1.5px solid rgba(39,174,96,0.15)" }}
          >
            <div className="rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ width: 38, height: 38, background: "rgba(39,174,96,0.12)", color: "#27AE60" }}>
              <CheckCircle size={17} />
            </div>
            <div className="flex-1">
              <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13.5, color: "#1E2340" }}>
                دورتك جاهزة تقريباً!
              </div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: "#5AA87A", marginTop: 2 }}>
                أضفت {lessons.length} {lessons.length === 1 ? "درس" : "دروس"} — يمكنك إضافة المزيد في أي وقت
              </div>
            </div>
          </div>

          {/* Finish button */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={onFinish}
              whileHover={{ y: -2, boxShadow: "0 10px 28px rgba(78,91,146,0.32)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 rounded-2xl px-6 py-3"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 4px 16px rgba(78,91,146,0.25)",
              }}
            >
              الانتهاء والعودة للرئيسية
              <ArrowRight size={15} />
            </motion.button>
            <button
              style={{
                height: 46,
                paddingLeft: 20,
                paddingRight: 20,
                borderRadius: 13,
                background: "transparent",
                color: "#9BA3C4",
                border: "1.5px solid rgba(78,91,146,0.14)",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { const b = e.currentTarget; b.style.color = PRIMARY; b.style.borderColor = "rgba(78,91,146,0.28)"; b.style.background = "rgba(78,91,146,0.04)"; }}
              onMouseLeave={(e) => { const b = e.currentTarget; b.style.color = "#9BA3C4"; b.style.borderColor = "rgba(78,91,146,0.14)"; b.style.background = "transparent"; }}
            >
              <ChevronLeft size={14} />
              تعديل معلومات الدورة
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}