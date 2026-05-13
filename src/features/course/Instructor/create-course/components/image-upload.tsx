import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, X, ImageIcon } from "lucide-react";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

interface ImageUploadProps {
  value: File | null;
  preview: string | null;
  onChange: (file: File | null, preview: string | null) => void;
  error?: string;
}

export function ImageUpload({ value, preview, onChange, error }: ImageUploadProps) {
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
