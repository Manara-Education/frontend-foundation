import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Pencil,
  BookOpen,
  X,
  ImageIcon,
  FileText,
  Save,
  Upload,
  DollarSign,
} from "lucide-react";
import type { EditCourseFormData } from "../types/add-lessons.types";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

interface EditCourseModalProps {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  onSave: (data: EditCourseFormData) => Promise<boolean>;
  onClose: () => void;
}

export function EditCourseModal({ title, description, imageUrl, price, onSave, onClose }: EditCourseModalProps) {
  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc] = useState(description);
  const [editImage, setEditImage] = useState(imageUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editPrice, setEditPrice] = useState(price > 0 ? String(price) : price === 0 ? "0" : "");
  const [priceError, setPriceError] = useState("");
  const [imgPreview, setImgPreview] = useState(imageUrl);
  const [titleError, setTitleError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const previewBlobRef = useRef<string | null>(null);

  useEffect(() => { titleInputRef.current?.focus(); }, []);

  useEffect(() => () => {
    if (previewBlobRef.current) URL.revokeObjectURL(previewBlobRef.current);
  }, []);

  const handleImageFile = (file: File | null) => {
    if (previewBlobRef.current) {
      URL.revokeObjectURL(previewBlobRef.current);
      previewBlobRef.current = null;
    }
    if (!file) { setImageFile(null); setEditImage(""); setImgPreview(""); return; }
    const url = URL.createObjectURL(file);
    previewBlobRef.current = url;
    setImageFile(file);
    setImgPreview(url);
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!editTitle.trim()) { setTitleError("يرجى إدخال عنوان الدورة"); return; }
    const parsedPrice = editPrice === "" ? 0 : parseFloat(editPrice);
    if (editPrice !== "" && (isNaN(parsedPrice) || parsedPrice < 0)) {
      setPriceError("لا يمكن أن يكون السعر قيمة سالبة");
      return;
    }
    setIsSaving(true);
    const success = await onSave({ title: editTitle.trim(), description: editDesc.trim(), imageUrl: editImage.trim(), imageFile, price: isNaN(parsedPrice) ? 0 : parsedPrice });
    if (success) {
      onClose();
    } else {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(14,18,42,0.45)",
          backdropFilter: "blur(6px)",
          zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
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
              onClick={handleClose}
              disabled={isSaving}
              className="rounded-xl flex items-center justify-center"
              style={{ width: 36, height: 36, background: "rgba(78,91,146,0.06)", border: "none", cursor: isSaving ? "not-allowed" : "pointer", color: "#9BA3C4", transition: "all 0.15s" }}
              onMouseEnter={(e) => { if (isSaving) return; e.currentTarget.style.background = "rgba(212,24,61,0.08)"; e.currentTarget.style.color = "#D4183D"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(78,91,146,0.06)"; e.currentTarget.style.color = "#9BA3C4"; }}
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex flex-col gap-6 p-7">
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
                onBlur={(e) => { if (!titleError && !editTitle) { e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)"; e.currentTarget.style.boxShadow = "none"; } }}
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
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#1E2340", display: "flex", alignItems: "center", gap: 5 }}>
                <DollarSign size={13} style={{ color: "#9BA3C4" }} />
                سعر الاشتراك بالدولار
                <span style={{ fontSize: 11, color: "#B0B7D4", fontWeight: 400 }}>(اختياري)</span>
              </label>

              <div
                style={{
                  display: "flex", alignItems: "center",
                  borderRadius: 13,
                  border: `1.5px solid ${priceError ? "#D4183D" : editPrice ? PRIMARY : "rgba(78,91,146,0.16)"}`,
                  background: priceError ? "rgba(212,24,61,0.02)" : editPrice ? "rgba(78,91,146,0.02)" : "#FAFBFD",
                  overflow: "hidden", direction: "ltr",
                  transition: "border-color 0.18s, background 0.18s, box-shadow 0.18s",
                  boxShadow: priceError
                    ? "0 0 0 3px rgba(212,24,61,0.07)"
                    : editPrice ? "0 0 0 3px rgba(78,91,146,0.07)" : "none",
                }}
                onFocusCapture={(e) => {
                  if (!priceError) {
                    e.currentTarget.style.borderColor = PRIMARY;
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.09)";
                  }
                }}
                onBlurCapture={(e) => {
                  if (!priceError && !editPrice) {
                    e.currentTarget.style.borderColor = "rgba(78,91,146,0.16)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    paddingLeft: 14, paddingRight: 10, height: 50, flexShrink: 0,
                    borderRight: `1.5px solid ${priceError ? "rgba(212,24,61,0.18)" : "rgba(78,91,146,0.10)"}`,
                    color: priceError ? "#D4183D" : editPrice ? PRIMARY : "#9BA3C4",
                    transition: "color 0.18s",
                  }}
                >
                  <DollarSign size={14} strokeWidth={2} />
                  <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>USD</span>
                </div>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => { setEditPrice(e.target.value); setPriceError(""); }}
                  placeholder="مثال: 49.99"
                  style={{
                    flex: 1, height: 50, border: "none", outline: "none",
                    background: "transparent", paddingLeft: 14, paddingRight: 14,
                    fontFamily: FONT, fontSize: 14, color: "#1E2340",
                    direction: "ltr", textAlign: "left",
                  }}
                />

                {editPrice === "0" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      marginLeft: 10, marginRight: 12,
                      padding: "3px 10px", borderRadius: 99,
                      background: "rgba(34,197,94,0.10)",
                      border: "1px solid rgba(34,197,94,0.22)",
                      fontFamily: FONT, fontSize: 11, color: "#15803D",
                      whiteSpace: "nowrap", flexShrink: 0,
                    }}
                  >
                    مجانية
                  </motion.div>
                )}
              </div>

              <AnimatePresence>
                {priceError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ fontFamily: FONT, fontSize: 12, color: "#D4183D", marginTop: 1 }}
                  >
                    {priceError}
                  </motion.p>
                )}
              </AnimatePresence>

              {!priceError && (
                <p style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", lineHeight: 1.6 }}>
                  أدخل سعر اشتراك الدورة بالدولار الأمريكي —{" "}
                  <span style={{ color: "#B0B7D4" }}>أدخل 0 لجعلها مجانية</span>
                </p>
              )}
            </div>

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

          <div className="flex items-center gap-3 px-7 py-5"
            style={{ borderTop: "1px solid rgba(78,91,146,0.08)" }}>
            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              whileHover={isSaving ? {} : { y: -2, boxShadow: "0 10px 26px rgba(78,91,146,0.30)" }}
              whileTap={isSaving ? {} : { scale: 0.97 }}
              transition={{ duration: 0.14 }}
              className="flex items-center gap-2 rounded-2xl px-6 py-3"
              style={{
                background: isSaving
                  ? "rgba(78,91,146,0.5)"
                  : `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
                color: "#fff", border: "none", cursor: isSaving ? "not-allowed" : "pointer",
                fontFamily: FONT, fontWeight: 700, fontSize: 14,
                boxShadow: isSaving ? "none" : "0 4px 16px rgba(78,91,146,0.26)",
                transition: "background 0.2s, box-shadow 0.2s",
              }}
            >
              {isSaving ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  جارٍ الحفظ...
                </>
              ) : (
                <>
                  <Save size={15} strokeWidth={2} />
                  حفظ التعديلات
                </>
              )}
            </motion.button>
            <button
              onClick={handleClose}
              disabled={isSaving}
              style={{
                height: 46, paddingLeft: 20, paddingRight: 20, borderRadius: 13,
                background: "transparent", color: "#717182",
                border: "1.5px solid rgba(78,91,146,0.16)",
                cursor: isSaving ? "not-allowed" : "pointer", fontFamily: FONT, fontWeight: 600, fontSize: 14, transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { if (isSaving) return; const b = e.currentTarget; b.style.color = PRIMARY; b.style.borderColor = "rgba(78,91,146,0.3)"; b.style.background = "rgba(78,91,146,0.04)"; }}
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
