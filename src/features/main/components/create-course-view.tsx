import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Upload,
  X,
  CheckCircle,
  Info,
  Sparkles,
  ImageIcon,
} from "lucide-react";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

// ── Shimmer skeleton ────────────────────────────────────────────────────────────

const SHIMMER_CSS = `
  @keyframes ccv-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .ccv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 35%,#F4F5FB 50%,#EAECF5 65%,#EAECF5 100%);
    background-size: 600px 100%;
    animation: ccv-shimmer 1.9s ease-in-out infinite;
  }
`;

function Sk({ w, h, r = 10, style = {} }: { w?: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="ccv-sk" style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }} />;
}

function FormSkeleton() {
  return (
    <>
      <style>{SHIMMER_CSS}</style>
      {/* Intro */}
      <div className="flex flex-col gap-2 mb-8">
        <Sk h={32} w={280} r={10} />
        <Sk h={16} w={360} r={7} />
      </div>
      {/* Card */}
      <div className="rounded-3xl p-8 mb-6" style={{ background: "#fff", border: "1px solid rgba(78,91,146,0.08)" }}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Sk h={14} w={100} r={6} />
            <Sk h={48} r={14} />
          </div>
          <div className="flex flex-col gap-2">
            <Sk h={14} w={120} r={6} />
            <Sk h={100} r={14} />
          </div>
          <div className="flex flex-col gap-2">
            <Sk h={14} w={90} r={6} />
            <Sk h={140} r={14} />
          </div>
        </div>
        <div className="flex justify-start gap-3 mt-8">
          <Sk h={46} w={140} r={14} />
          <Sk h={46} w={100} r={14} />
        </div>
      </div>
      {/* Helper */}
      <Sk h={60} r={16} />
    </>
  );
}

// ── Success overlay ─────────────────────────────────────────────────────────────

function SuccessOverlay({ title, onClose, onAddLessons }: { title: string; onClose: () => void; onAddLessons: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(30,35,64,0.45)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="flex flex-col items-center gap-5 p-10 mx-4"
        dir="rtl"
        style={{
          background: "#fff",
          borderRadius: 28,
          boxShadow: "0 24px 80px rgba(78,91,146,0.25)",
          maxWidth: 400,
          width: "100%",
          fontFamily: FONT,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 18 }}
          className="rounded-full flex items-center justify-center"
          style={{ width: 72, height: 72, background: "rgba(39,174,96,0.12)", color: "#27AE60" }}
        >
          <CheckCircle size={36} />
        </motion.div>
        <div className="text-center flex flex-col gap-1.5">
          <h2 style={{ fontWeight: 700, fontSize: 20, color: "#1E2340" }}>تم إنشاء الدورة بنجاح!</h2>
          <p style={{ fontSize: 14, color: "#717182", lineHeight: 1.7 }}>
            تم إنشاء دورة «{title}» بنجاح. يمكنك الآن البدء في إضافة الدروس والمحتوى.
          </p>
        </div>
        <button
          onClick={onAddLessons}
          className="w-full rounded-2xl py-3 transition-all duration-150"
          style={{
            background: PRIMARY,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 15,
            boxShadow: "0 4px 16px rgba(78,91,146,0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(78,91,146,0.38)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(78,91,146,0.3)";
          }}
        >
          رائع، لنضف الدروس!
        </button>
        <button
          onClick={onClose}
          style={{
            marginTop: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 13,
            color: "#9BA3C4",
            textDecoration: "underline",
          }}
        >
          لاحقاً
        </button>
      </div>
    </motion.div>
  );
}

// ── Field components ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 13.5,
          color: "#1E2340",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#D4183D", fontSize: 14, lineHeight: 1 }}>*</span>
        )}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
            style={{ fontFamily: FONT, fontSize: 12, color: "#D4183D", marginTop: 1 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Image Upload ────────────────────────────────────────────────────────────────

interface ImageUploadProps {
  value: File | null;
  preview: string | null;
  onChange: (file: File | null, preview: string | null) => void;
  error?: string;
}

function ImageUpload({ value, preview, onChange, error }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file: File | null) => {
    if (!file) { onChange(null, null); return; }
    const url = URL.createObjectURL(file);
    onChange(file, url);
  }, [onChange]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13.5, color: "#1E2340", display: "flex", alignItems: "center", gap: 4 }}>
        صورة الدورة
      </label>

      {preview ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
          className="relative overflow-hidden"
          style={{ borderRadius: 16, height: 200 }}
        >
          <img src={preview} alt="معاينة" className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(14,18,42,0.5) 100%)" }}
          />
          <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between">
            <span
              className="rounded-xl px-3 py-1"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", color: "#fff", fontFamily: FONT, fontSize: 12, fontWeight: 600 }}
            >
              {value?.name}
            </span>
            <button
              onClick={() => onChange(null, null)}
              className="rounded-full flex items-center justify-center transition-all"
              style={{ width: 32, height: 32, background: "rgba(212,24,61,0.85)", color: "#fff", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(212,24,61,1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(212,24,61,0.85)"}
            >
              <X size={15} />
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200"
          style={{
            borderRadius: 16,
            height: 160,
            border: `2px dashed ${hasError ? "#D4183D" : dragging ? PRIMARY : "rgba(78,91,146,0.22)"}`,
            background: dragging ? "rgba(78,91,146,0.04)" : hasError ? "rgba(212,24,61,0.03)" : "rgba(78,91,146,0.02)",
          }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="rounded-2xl flex items-center justify-center"
            style={{ width: 48, height: 48, background: dragging ? `rgba(78,91,146,0.12)` : "rgba(78,91,146,0.07)", color: dragging ? PRIMARY : "#9BA3C4" }}
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
              className="flex items-center gap-1.5 rounded-xl px-4 py-1.5 transition-all"
              style={{
                background: "rgba(78,91,146,0.08)",
                color: PRIMARY,
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 12,
              }}
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
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
            style={{ fontFamily: FONT, fontSize: 12, color: "#D4183D", marginTop: 1 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────

interface CreateCourseViewProps {
  onCancel?: () => void;
  onCourseCreated?: (title: string) => void;
}

export function CreateCourseView({ onCancel, onCourseCreated }: CreateCourseViewProps) {
  const [isLoading] = useState(false); // set to true briefly if needed
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = () => {
    const e: { title?: string; description?: string } = {};
    if (!title.trim()) e.title = "يرجى إدخال اسم الدورة";
    else if (title.trim().length < 5) e.title = "اسم الدورة يجب أن يكون 5 أحرف على الأقل";
    if (!description.trim()) e.description = "يرجى إدخال وصف مختصر للدورة";
    else if (description.trim().length < 20) e.description = "الوصف يجب أن يكون 20 حرفاً على الأقل";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1600));
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setTitle("");
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
    onCancel?.();
  };

  if (isLoading) {
    return (
      <div dir="rtl" style={{ fontFamily: FONT }}>
        <FormSkeleton />
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      {/* ── INTRO BLOCK ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ width: 44, height: 44, background: `rgba(78,91,146,0.1)`, color: PRIMARY }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 22, color: "#1E2340", lineHeight: 1.3 }}>
              ابدأ بإنشاء دورة جديدة
            </h1>
            <p style={{ fontSize: 13.5, color: "#717182", marginTop: 2 }}>
              أدخل المعلومات الأساسية لبدء إعداد دورتك
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── FORM CARD ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.08 }}
        className="mb-5"
        style={{
          background: "#ffffff",
          borderRadius: 24,
          padding: "36px 36px 32px",
          border: "1.5px solid rgba(78,91,146,0.09)",
          boxShadow: "0 4px 32px rgba(78,91,146,0.08), 0 1px 4px rgba(78,91,146,0.05)",
        }}
      >
        <div className="flex flex-col gap-6">

          {/* ── Course Name ── */}
          <Field label="اسم الدورة" required error={errors.title}>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((prev) => ({ ...prev, title: undefined })); }}
                placeholder="مثال: أساسيات البرمجة"
                style={{
                  width: "100%",
                  height: 50,
                  borderRadius: 14,
                  border: `1.5px solid ${errors.title ? "#D4183D" : title ? PRIMARY : "rgba(78,91,146,0.16)"}`,
                  background: errors.title ? "rgba(212,24,61,0.02)" : title ? "rgba(78,91,146,0.02)" : "#FAFBFD",
                  paddingRight: 48,
                  paddingLeft: 14,
                  fontFamily: FONT,
                  fontSize: 14,
                  color: "#1E2340",
                  outline: "none",
                  transition: "border-color 0.18s, background 0.18s, box-shadow 0.18s",
                  boxSizing: "border-box",
                  boxShadow: title && !errors.title ? `0 0 0 3px rgba(78,91,146,0.07)` : errors.title ? "0 0 0 3px rgba(212,24,61,0.07)" : "none",
                }}
                onFocus={(e) => {
                  if (!errors.title) {
                    e.currentTarget.style.borderColor = PRIMARY;
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.1)";
                  }
                }}
                onBlur={(e) => {
                  if (!errors.title && !title) {
                    e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              />
              <div
                className="absolute top-1/2 right-3.5 flex items-center justify-center"
                style={{ transform: "translateY(-50%)", color: errors.title ? "#D4183D" : title ? PRIMARY : "#C4C9DC", transition: "color 0.18s" }}
              >
                <BookOpen size={16} />
              </div>
            </div>
          </Field>

          {/* ── Description ── */}
          <Field label="وصف الدورة" required error={errors.description}>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors((prev) => ({ ...prev, description: undefined })); }}
                placeholder="اكتب وصفًا مختصرًا عن الدورة وما سيتعلمه الطلاب منها..."
                rows={4}
                style={{
                  width: "100%",
                  borderRadius: 14,
                  border: `1.5px solid ${errors.description ? "#D4183D" : description ? PRIMARY : "rgba(78,91,146,0.16)"}`,
                  background: errors.description ? "rgba(212,24,61,0.02)" : description ? "rgba(78,91,146,0.02)" : "#FAFBFD",
                  padding: "14px 16px",
                  fontFamily: FONT,
                  fontSize: 14,
                  color: "#1E2340",
                  outline: "none",
                  resize: "vertical",
                  minHeight: 110,
                  lineHeight: 1.75,
                  transition: "border-color 0.18s, background 0.18s, box-shadow 0.18s",
                  boxSizing: "border-box",
                  boxShadow: description && !errors.description ? `0 0 0 3px rgba(78,91,146,0.07)` : errors.description ? "0 0 0 3px rgba(212,24,61,0.07)" : "none",
                }}
                onFocus={(e) => {
                  if (!errors.description) {
                    e.currentTarget.style.borderColor = PRIMARY;
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.1)";
                  }
                }}
                onBlur={(e) => {
                  if (!errors.description && !description) {
                    e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              />
              <div
                className="absolute bottom-3 left-3"
                style={{ fontFamily: FONT, fontSize: 11, color: description.length > 0 ? "#9BA3C4" : "#C4C9DC" }}
              >
                {description.length} حرف
              </div>
            </div>
          </Field>

          {/* ── Image Upload ── */}
          <ImageUpload
            value={imageFile}
            preview={imagePreview}
            onChange={(f, p) => { setImageFile(f); setImagePreview(p); }}
          />
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ height: 1, background: "rgba(78,91,146,0.07)", margin: "28px 0 24px" }} />

        {/* ── ACTIONS ── */}
        <div className="flex items-center gap-3 justify-start">
          {/* Primary */}
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { y: -2 } : {}}
            whileTap={!isSubmitting ? { scale: 0.97 } : {}}
            transition={{ duration: 0.15 }}
            style={{
              height: 48,
              paddingLeft: 28,
              paddingRight: 28,
              borderRadius: 14,
              background: isSubmitting
                ? "rgba(78,91,146,0.5)"
                : `linear-gradient(135deg, #4E5B92 0%, #6172AC 100%)`,
              color: "#ffffff",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: isSubmitting ? "none" : "0 4px 16px rgba(78,91,146,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "background 0.2s, box-shadow 0.2s",
              flexShrink: 0,
            }}
          >
            {isSubmitting ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                جارٍ الإنشاء...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                إنشاء الدورة
              </>
            )}
          </motion.button>

          {/* Secondary */}
          <motion.button
            onClick={onCancel}
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { y: -1 } : {}}
            whileTap={!isSubmitting ? { scale: 0.97 } : {}}
            transition={{ duration: 0.15 }}
            style={{
              height: 48,
              paddingLeft: 24,
              paddingRight: 24,
              borderRadius: 14,
              background: "transparent",
              color: "#717182",
              border: "1.5px solid rgba(78,91,146,0.18)",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 14,
              transition: "border-color 0.18s, color 0.18s, background 0.18s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(78,91,146,0.35)";
                (e.currentTarget as HTMLButtonElement).style.color = PRIMARY;
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(78,91,146,0.04)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(78,91,146,0.18)";
                (e.currentTarget as HTMLButtonElement).style.color = "#717182";
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }
            }}
          >
            إلغاء
          </motion.button>
        </div>
      </motion.div>

      {/* ── HELPER BLOCK ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.18 }}
        className="flex items-start gap-3 p-4 rounded-2xl"
        style={{
          background: "rgba(78,91,146,0.05)",
          border: "1px solid rgba(78,91,146,0.1)",
        }}
      >
        <div
          className="rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ width: 34, height: 34, background: "rgba(78,91,146,0.1)", color: PRIMARY }}
        >
          <Info size={15} />
        </div>
        <div>
          <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340", lineHeight: 1.5 }}>
            يمكنك إضافة الدروس والاختبارات بعد إنشاء الدورة
          </p>
          <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: 12, color: "#9BA3C4", marginTop: 3, lineHeight: 1.6 }}>
            بعد الإنشاء ستظهر الدورة في لوحتك حيث يمكنك إضافة المحتوى والدروس وإدارة الطلاب بسهولة.
          </p>
        </div>
      </motion.div>

      {/* ── SUCCESS OVERLAY ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessOverlay
            title={title}
            onClose={handleSuccessClose}
            onAddLessons={() => {
              const savedTitle = title;
              setShowSuccess(false);
              onCourseCreated?.(savedTitle);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}