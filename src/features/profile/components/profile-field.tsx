import type { ProfileFieldProps } from "@/features/profile/types/profile.types";

const PRIMARY = "#4E5B92";

export function ProfileField({ label, value, onChange, readOnly = false, placeholder }: ProfileFieldProps) {
  return (
    <div className="flex flex-col gap-1.5" dir="rtl">
      <label style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#4A4A6A" }}>{label}</label>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl px-4 py-2.5 outline-none transition-all duration-150"
        style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, fontWeight: 500, color: readOnly ? "#9BA3C4" : "#1E2340", background: readOnly ? "rgba(78,91,146,0.04)" : "#F6F7FC", border: `1.5px solid ${readOnly ? "rgba(78,91,146,0.07)" : "rgba(78,91,146,0.12)"}`, cursor: readOnly ? "not-allowed" : "text", direction: "rtl" }}
        onFocus={(e) => { if (!readOnly) e.currentTarget.style.borderColor = PRIMARY; }}
        onBlur={(e) => { if (!readOnly) e.currentTarget.style.borderColor = "rgba(78,91,146,0.12)"; }}
      />
    </div>
  );
}
