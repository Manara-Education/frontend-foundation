import { ArrowLeft, CheckCircle2, Play } from "lucide-react";
import { PRIMARY, FONT, TEXT, TEXT_MUTED, TEXT_LIGHT, BORDER } from "./theme";

export function ProgressMockup() {
  return (
    <div className="rs-longform" style={{ background: "#fff", borderRadius: 24, border: `1px solid ${BORDER}`, boxShadow: "0 8px 40px rgba(78,91,146,0.1)", padding: "clamp(22px, 7vw, 28px)", fontFamily: FONT, direction: "rtl" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ position: "relative", inlineSize: "min(120px, 46vw)", maxInlineSize: "100%", aspectRatio: "1 / 1", margin: "0 auto 16px" }}>
          <svg viewBox="0 0 120 120" style={{ inlineSize: "100%", blockSize: "100%", transform: "rotate(-90deg)" }}>
            <circle cx="60" cy="60" r="52" fill="none" stroke={`${PRIMARY}15`} strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={PRIMARY} strokeWidth="10" strokeDasharray="326.7" strokeDashoffset="91.5" strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontWeight: 800, fontSize: 28, color: PRIMARY, lineHeight: 1 }}>٧٢٪</span>
            <span style={{ fontSize: 11, color: TEXT_LIGHT, marginTop: 2 }}>مكتمل</span>
          </div>
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, color: TEXT }}>تطوير تطبيقات Android</div>
        <div style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>١٨ من ٢٥ درس مكتمل</div>
      </div>
      {[
        { label: "مكتملة", icon: <CheckCircle2 size={14} />, text: "Kotlin + Compose", color: "#22C55E" },
        { label: "جارٍ الآن", icon: <Play size={13} />, text: "إدارة الحالة", color: PRIMARY },
        { label: "التالي", icon: <ArrowLeft size={13} />, text: "الهندسة المعمارية", color: TEXT_LIGHT },
      ].map(({ label, icon, text, color }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px 12px", flexWrap: "wrap", padding: "10px 0", borderTop: `1px solid rgba(78,91,146,0.07)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minInlineSize: 0 }}>
            <div style={{ color, display: "flex" }}>{icon}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color }}>{label}</span>
          </div>
          <span style={{ fontSize: 12.5, color: TEXT_MUTED, minInlineSize: 0 }}>{text}</span>
        </div>
      ))}
    </div>
  );
}
