import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronDown,
  Eye,
  Info,
  Upload,
  X,
} from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";
import { useIsMobile } from "@/shared/responsive";
import { BannerStudentPreview } from "@/features/banner/components/banner-student-preview";
import type { BannerDisplayFrequency } from "@/features/banner/types/banner.types";
import {
  DURATION_SHORTCUTS,
  FONT,
  FREQUENCY_OPTIONS,
  PRIMARY,
  TIMEZONES,
} from "../formatters/banners.formatter";
import type {
  BannerFormErrors,
  BannerFormState,
  BannerSaveAction,
} from "../types/banners.types";

interface BannerFormProps {
  form: BannerFormState;
  errors: BannerFormErrors;
  saving: boolean;
  uploading: boolean;
  savedMessage: string;
  isEditing: boolean;
  onFieldChange: (patch: Partial<BannerFormState>) => void;
  onClearError: (field: keyof BannerFormErrors) => void;
  onApplyDuration: (days: number) => void;
  onImageFile: (file: File | null | undefined) => void;
  onRemoveImage: () => void;
  onSave: (action: BannerSaveAction) => void;
  onCancel: () => void;
}

const inputBase: CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1.5px solid rgba(78,91,146,0.16)",
  background: "#FAFBFD",
  fontFamily: FONT,
  fontSize: 14,
  color: "#1E2340",
  outline: "none",
  padding: "10px 14px",
  transition: "border-color 0.18s, box-shadow 0.18s",
  boxSizing: "border-box",
  minWidth: 0,
};

const labelStyle: CSSProperties = { fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340" };
const errStyle: CSSProperties = { fontFamily: FONT, fontSize: 11.5, color: "#D4183D", marginTop: 4 };
const cardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 20,
  border: "1.5px solid rgba(78,91,146,0.1)",
  padding: "clamp(16px, 5vw, 22px) clamp(16px, 5vw, 24px)",
  boxShadow: "0 2px 12px rgba(78,91,146,0.05)",
  boxSizing: "border-box",
  minInlineSize: 0,
};
const cardTitleStyle: CSSProperties = {
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 14,
  color: "#1E2340",
  margin: "0 0 18px",
};
const formGridStyle = {
  "--rs-grid-min": "300px",
  "--rs-grid-gap": "clamp(18px, 4vw, 28px)",
  alignItems: "start",
} as CSSProperties;
const pairedFieldGridStyle = {
  "--rs-grid-min": "180px",
  "--rs-grid-gap": "12px",
} as CSSProperties;
const durationClusterStyle = {
  "--rs-cluster-gap": "8px",
} as CSSProperties;

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rs-longform">
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: "#D4183D", marginInlineStart: 3 }}>*</span>}
      </label>
      {children}
      {error && <p className="rs-longform" style={errStyle}>{error}</p>}
    </div>
  );
}

export function BannerForm({
  form,
  errors,
  saving,
  uploading,
  savedMessage,
  isEditing,
  onFieldChange,
  onClearError,
  onApplyDuration,
  onImageFile,
  onRemoveImage,
  onSave,
  onCancel,
}: BannerFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  return (
    <div dir="rtl" style={{ fontFamily: FONT, maxInlineSize: "100%", minInlineSize: 0 }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          className="rs-touch"
          onClick={onCancel}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#9BA3C4",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontFamily: FONT,
            fontSize: 13,
            minHeight: 44,
            paddingInline: 4,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = PRIMARY;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#9BA3C4";
          }}
        >
          <ArrowRight size={15} strokeWidth={2} />
          العودة للإعلانات
        </button>
        <span style={{ color: "#D0D4E8" }}>·</span>
        <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: "#1E2340", margin: 0 }}>
          {isEditing ? "تعديل الإعلان" : "إنشاء إعلان جديد"}
        </h2>
      </div>

      <div className="rs-grid" style={formGridStyle}>
        {/* ── Form ── */}
        <div className="flex flex-col gap-6" style={{ minWidth: 0 }}>
          {/* Basic info */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>المعلومات الأساسية</h3>
            <div className="flex flex-col gap-4">
              <Field label="الاسم الداخلي" required error={errors.internalName}>
                <input
                  type="text"
                  value={form.internalName}
                  onChange={(e) => {
                    onFieldChange({ internalName: e.target.value });
                    onClearError("internalName");
                  }}
                  placeholder="مثال: عرض رمضان ٢٠٢٦"
                  style={{
                    ...inputBase,
                    border: `1.5px solid ${errors.internalName ? "#D4183D" : "rgba(78,91,146,0.16)"}`,
                  }}
                />
              <p style={{ fontFamily: FONT, fontSize: 11, color: "#B0B7D4", marginTop: 2 }}>
                مرئي للمدرس فقط — لا يراه الطلاب
              </p>
              </Field>
              <Field label="عنوان الإعلان" required error={errors.title}>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    onFieldChange({ title: e.target.value });
                    onClearError("title");
                  }}
                  placeholder="النص الرئيسي الذي سيراه الطلاب"
                  style={{
                    ...inputBase,
                    border: `1.5px solid ${errors.title ? "#D4183D" : "rgba(78,91,146,0.16)"}`,
                  }}
                />
              </Field>
              <Field label="وصف مختصر">
                <textarea
                  value={form.description}
                  onChange={(e) => onFieldChange({ description: e.target.value })}
                  placeholder="نص داعم اختياري يظهر أسفل العنوان..."
                  rows={2}
                  style={{ ...inputBase, resize: "vertical", minHeight: 72, lineHeight: 1.7 }}
                />
              </Field>
            </div>
          </div>

          {/* Image */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>صورة الإعلان</h3>
            <div className="flex flex-col gap-3">
              {form.imageUrl ? (
                <div
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    position: "relative",
                    aspectRatio: "16 / 7",
                    minHeight: 120,
                  }}
                >
                  <ImageWithFallback
                    src={form.imageUrl}
                    alt="معاينة الصورة"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    className="rs-touch"
                    onClick={onRemoveImage}
                    style={{
                      position: "absolute",
                      top: 8,
                      insetInlineEnd: 8,
                      width: 44,
                      height: 44,
                      borderRadius: 99,
                      background: "rgba(0,0,0,0.5)",
                      border: "none",
                      cursor: "pointer",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    minHeight: 112,
                    borderRadius: 14,
                    background: "rgba(78,91,146,0.03)",
                    border: "1.5px dashed rgba(78,91,146,0.2)",
                    cursor: uploading ? "default" : "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "16px",
                    color: "#9BA3C4",
                    transition: "all 0.15s",
                    boxSizing: "border-box",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(78,91,146,0.06)";
                    e.currentTarget.style.borderColor = "rgba(78,91,146,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(78,91,146,0.03)";
                    e.currentTarget.style.borderColor = "rgba(78,91,146,0.2)";
                  }}
                >
                  <Upload size={20} strokeWidth={1.5} />
                  <span style={{ fontFamily: FONT, fontSize: 13 }}>
                    {uploading ? "جارٍ رفع الصورة..." : "اضغط لرفع صورة"}
                  </span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={(e) => onImageFile(e.target.files?.[0])}
              />
              <p className="rs-longform" style={{ fontFamily: FONT, fontSize: 11.5, color: "#B0B7D4" }}>
                أو أدخل رابط الصورة مباشرةً (PNG، JPG، WebP — الحد الأقصى ٥ ميجابايت)
              </p>
              <Field label="" error={errors.imageUrl}>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => onFieldChange({ imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  style={{ ...inputBase, fontSize: 12.5 }}
                />
              </Field>
            </div>
          </div>

          {/* CTA */}
          <div style={cardStyle}>
            <h3 style={{ ...cardTitleStyle, margin: "0 0 4px" }}>زر الإجراء</h3>
            <p style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", marginBottom: 16 }}>
              اختياري — يظهر كزر داخل الإعلان
            </p>
            <div className="flex flex-col gap-4">
              <Field label="نص الزر">
                <input
                  type="text"
                  value={form.callToActionLabel}
                  onChange={(e) => onFieldChange({ callToActionLabel: e.target.value })}
                  placeholder="مثال: سجّل الآن"
                  style={inputBase}
                />
              </Field>
              <Field label="رابط الوجهة" error={errors.callToActionUrl}>
                <input
                  type="text"
                  value={form.callToActionUrl}
                  onChange={(e) => {
                    onFieldChange({ callToActionUrl: e.target.value });
                    onClearError("callToActionUrl");
                  }}
                  placeholder="https://example.com أو #course-id"
                  style={{
                    ...inputBase,
                    border: `1.5px solid ${errors.callToActionUrl ? "#D4183D" : "rgba(78,91,146,0.16)"}`,
                  }}
                />
              </Field>
            </div>
          </div>

          {/* Scheduling */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>الجدولة والمدة</h3>
            <div className="flex flex-col gap-4">
              <div className="rs-grid" style={pairedFieldGridStyle}>
                <Field label="تاريخ البدء">
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => onFieldChange({ startDate: e.target.value })}
                    style={{ ...inputBase, height: 44 }}
                  />
                </Field>
                <Field label="وقت البدء">
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => onFieldChange({ startTime: e.target.value })}
                    style={{ ...inputBase, height: 44 }}
                  />
                </Field>
              </div>

              {/* Duration shortcuts */}
              <div>
                <p style={{ ...labelStyle, marginBottom: 8 }}>مدة العرض — اختصارات</p>
                <div className="rs-cluster" style={durationClusterStyle}>
                  {DURATION_SHORTCUTS.map((d) => (
                    <button
                      className="rs-touch"
                      key={d.days}
                      onClick={() => onApplyDuration(d.days)}
                      style={{
                        minHeight: 44,
                        paddingInline: 14,
                        borderRadius: 10,
                        background: "rgba(78,91,146,0.06)",
                        border: "1.5px solid rgba(78,91,146,0.14)",
                        cursor: "pointer",
                        fontFamily: FONT,
                        fontSize: 12.5,
                        color: PRIMARY,
                        fontWeight: 600,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(78,91,146,0.14)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(78,91,146,0.06)";
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rs-grid" style={pairedFieldGridStyle}>
                <Field label="تاريخ الانتهاء" required error={errors.endDate}>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => {
                      onFieldChange({ endDate: e.target.value });
                      onClearError("endDate");
                    }}
                    style={{
                      ...inputBase,
                      height: 44,
                      border: `1.5px solid ${errors.endDate ? "#D4183D" : "rgba(78,91,146,0.16)"}`,
                    }}
                  />
                </Field>
                <Field label="وقت الانتهاء">
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => onFieldChange({ endTime: e.target.value })}
                    style={{ ...inputBase, height: 44 }}
                  />
                </Field>
              </div>

              <Field label="المنطقة الزمنية">
                <div style={{ position: "relative" }}>
                  <select
                    value={form.timezone}
                    onChange={(e) => onFieldChange({ timezone: e.target.value })}
                    style={{ ...inputBase, height: 44, appearance: "none", paddingInlineEnd: 36, cursor: "pointer" }}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    style={{
                      position: "absolute",
                      insetInlineEnd: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9BA3C4",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* Display config */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>إعدادات العرض</h3>
            <div className="flex flex-col gap-4">
              <Field label="تكرار العرض">
                <div style={{ position: "relative" }}>
                  <select
                    value={form.displayFrequency}
                    onChange={(e) =>
                      onFieldChange({ displayFrequency: e.target.value as BannerDisplayFrequency })
                    }
                    style={{ ...inputBase, height: 44, appearance: "none", paddingInlineEnd: 36, cursor: "pointer" }}
                  >
                    {FREQUENCY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    style={{
                      position: "absolute",
                      insetInlineEnd: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9BA3C4",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </Field>

              {/* Toggles */}
              <div className="flex flex-col gap-3">
                {[
                  {
                    key: "isEnabled" as const,
                    label: "تفعيل الإعلان",
                    desc: "يظهر الإعلان للطلاب عند اكتمال الشروط",
                  },
                  {
                    key: "isDismissible" as const,
                    label: "السماح بالإغلاق",
                    desc: "يمكن للطالب إغلاق الإعلان",
                  },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4"
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "rgba(78,91,146,0.03)",
                      border: "1px solid rgba(78,91,146,0.08)",
                    }}
                  >
                    <div className="rs-longform" style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340" }}>{label}</div>
                      <div style={{ fontFamily: FONT, fontSize: 11.5, color: "#9BA3C4", marginTop: 2 }}>{desc}</div>
                    </div>
                    <button
                      className="rs-touch"
                      onClick={() => onFieldChange({ [key]: !form[key] })}
                      style={{
                        width: 64,
                        height: 44,
                        borderRadius: 99,
                        background: form[key] ? PRIMARY : "rgba(78,91,146,0.15)",
                        border: "none",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background 0.22s",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 11,
                          insetInlineStart: form[key] ? 8 : 34,
                          width: 22,
                          height: 22,
                          borderRadius: 99,
                          background: "#fff",
                          transition: "inset-inline-start 0.22s",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* A refused save says why, in the same place the buttons are. */}
          {errors.general && (
            <div
              className="flex items-center gap-2"
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(212,24,61,0.06)",
                border: "1px solid rgba(212,24,61,0.16)",
                color: "#B91C1C",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <AlertTriangle size={15} strokeWidth={1.9} /> {errors.general}
            </div>
          )}

          {/* Actions */}
          <div className="rs-cluster" style={{ "--rs-cluster-gap": "12px" } as CSSProperties}>
            {savedMessage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 rs-longform"
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  color: "#15803D",
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                <CheckCircle size={16} /> {savedMessage}
              </motion.div>
            ) : (
              <>
                <button
                  onClick={() => onSave("publish")}
                  disabled={saving}
                  style={{
                    minHeight: 46,
                    paddingInline: 24,
                    borderRadius: 13,
                    background: saving
                      ? "rgba(78,91,146,0.3)"
                      : `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
                    color: "#fff",
                    border: "none",
                    cursor: saving ? "default" : "pointer",
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    boxShadow: saving ? "none" : "0 4px 16px rgba(78,91,146,0.25)",
                    transition: "all 0.15s",
                  }}
                >
                  <CheckCircle size={16} /> {saving ? "جارٍ الحفظ..." : "نشر الآن"}
                </button>
                <button
                  onClick={() => onSave("schedule")}
                  disabled={saving}
                  style={{
                    minHeight: 46,
                    paddingInline: 20,
                    borderRadius: 13,
                    background: "rgba(59,130,246,0.09)",
                    color: "#1D4ED8",
                    border: "1.5px solid rgba(59,130,246,0.2)",
                    cursor: saving ? "default" : "pointer",
                    fontFamily: FONT,
                    fontWeight: 600,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Calendar size={15} /> جدولة
                </button>
                <button
                  onClick={() => onSave("draft")}
                  disabled={saving}
                  style={{
                    minHeight: 46,
                    paddingInline: 20,
                    borderRadius: 13,
                    background: "transparent",
                    color: "#717182",
                    border: "1.5px solid rgba(78,91,146,0.16)",
                    cursor: saving ? "default" : "pointer",
                    fontFamily: FONT,
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  حفظ كمسودة
                </button>
                <button
                  onClick={onCancel}
                  style={{
                    minHeight: 46,
                    paddingInline: 18,
                    borderRadius: 13,
                    background: "transparent",
                    color: "#C4C9DC",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: FONT,
                    fontSize: 14,
                  }}
                >
                  إلغاء
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Live Preview ── */}
        <div style={{ position: isMobile ? "static" : "sticky", top: 24, minWidth: 0 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid rgba(78,91,146,0.1)",
              padding: "18px 20px",
              boxShadow: "0 2px 12px rgba(78,91,146,0.05)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Eye size={14} strokeWidth={1.8} color={PRIMARY} />
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: "#1E2340" }}>معاينة الإعلان</span>
            </div>
            <BannerStudentPreview banner={form} onDismiss={form.isDismissible ? () => {} : undefined} compact />
            <div
              className="flex items-start gap-2 mt-4"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(78,91,146,0.04)",
                border: "1px solid rgba(78,91,146,0.08)",
              }}
            >
              <Info size={13} strokeWidth={1.8} color="#9BA3C4" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontFamily: FONT, fontSize: 11.5, color: "#9BA3C4", margin: 0, lineHeight: 1.6 }}>
                هذه معاينة تقريبية. المظهر النهائي قد يختلف قليلاً حسب حجم الشاشة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
