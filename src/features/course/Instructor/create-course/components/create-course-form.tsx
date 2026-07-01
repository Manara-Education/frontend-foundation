import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Info, Sparkles, DollarSign } from "lucide-react";
import type { CreateCourseErrors } from "../types/create-course.types";
import { Field } from "./field";
import { ImageUpload } from "./image-upload";
import { SuccessOverlay } from "./success-overlay";
import { ErrorOverlay } from "@/shared/components/ErrorOverlay/ErrorOverlay";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

interface CreateCourseFormProps {
  title: string;
  description: string;
  price: string;
  imageFile: File | null;
  imagePreview: string | null;
  errors: CreateCourseErrors;
  error: string | null;
  isSubmitting: boolean;
  showSuccess: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onImageChange: (file: File | null, preview: string | null) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  onSuccessClose: () => void;
  onAddLessons: () => void;
  onErrorClose: () => void;
}

export function CreateCourseForm({
  title,
  description,
  price,
  imageFile,
  imagePreview,
  errors,
  error,
  isSubmitting,
  showSuccess,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onImageChange,
  onSubmit,
  onCancel,
  onSuccessClose,
  onAddLessons,
  onErrorClose,
}: CreateCourseFormProps) {
  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
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
          <Field label="اسم الدورة" required error={errors.title}>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
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

          <Field label="وصف الدورة" required error={errors.description}>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
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

          <Field label="سعر الاشتراك بالدولار" error={errors.price}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: 14,
                border: `1.5px solid ${errors.price ? "#D4183D" : price ? PRIMARY : "rgba(78,91,146,0.16)"}`,
                background: errors.price ? "rgba(212,24,61,0.02)" : price ? "rgba(78,91,146,0.02)" : "#FAFBFD",
                overflow: "hidden",
                direction: "ltr",
                transition: "border-color 0.18s, background 0.18s, box-shadow 0.18s",
                boxShadow: price && !errors.price
                  ? "0 0 0 3px rgba(78,91,146,0.07)"
                  : errors.price
                  ? "0 0 0 3px rgba(212,24,61,0.07)"
                  : "none",
              }}
              onFocusCapture={(e) => {
                const el = e.currentTarget;
                if (!errors.price) {
                  el.style.borderColor = PRIMARY;
                  el.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.1)";
                }
              }}
              onBlurCapture={(e) => {
                const el = e.currentTarget;
                if (!errors.price && !price) {
                  el.style.borderColor = "rgba(78,91,146,0.16)";
                  el.style.boxShadow = "none";
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  paddingLeft: 14,
                  paddingRight: 10,
                  height: 50,
                  borderRight: `1.5px solid ${errors.price ? "rgba(212,24,61,0.18)" : "rgba(78,91,146,0.10)"}`,
                  flexShrink: 0,
                  color: errors.price ? "#D4183D" : price ? PRIMARY : "#9BA3C4",
                  transition: "color 0.18s",
                }}
              >
                <DollarSign size={15} strokeWidth={2} />
                <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, letterSpacing: 0.3 }}>
                  USD
                </span>
              </div>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
                placeholder="مثال: 49.99"
                style={{
                  flex: 1,
                  height: 50,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  paddingLeft: 14,
                  paddingRight: 14,
                  fontFamily: FONT,
                  fontSize: 14,
                  color: "#1E2340",
                  direction: "ltr",
                  textAlign: "left",
                }}
              />

              {price === "0" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    marginLeft: 10,
                    marginRight: 12,
                    padding: "3px 10px",
                    borderRadius: 99,
                    background: "rgba(34,197,94,0.10)",
                    border: "1px solid rgba(34,197,94,0.22)",
                    fontFamily: FONT,
                    fontSize: 11,
                    color: "#15803D",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  مجانية
                </motion.div>
              )}
            </div>

            <p
              style={{
                fontFamily: FONT,
                fontSize: 12,
                color: "#9BA3C4",
                marginTop: 5,
                lineHeight: 1.6,
              }}
            >
              أدخل سعر اشتراك الدورة بالدولار الأمريكي —{" "}
              <span style={{ color: "#B0B7D4" }}>أدخل 0 لجعلها مجانية</span>
            </p>
          </Field>

          <ImageUpload
            value={imageFile}
            preview={imagePreview}
            onChange={onImageChange}
          />
        </div>

        <div style={{ height: 1, background: "rgba(78,91,146,0.07)", margin: "28px 0 24px" }} />

        <div className="flex items-center gap-3 justify-start">
          <motion.button
            onClick={onSubmit}
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

          <motion.button
            type="button"
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

      <AnimatePresence>
        {showSuccess && (
          <SuccessOverlay
            title={title}
            onClose={onSuccessClose}
            onAddLessons={onAddLessons}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <ErrorOverlay
            message={error}
            onRetry={onSubmit}
            onClose={onErrorClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
