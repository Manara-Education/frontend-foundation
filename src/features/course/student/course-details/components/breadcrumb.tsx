import { ChevronRight } from "lucide-react";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";

export function Breadcrumb({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
      <button
        onClick={onBack}
        style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9BA3C4")}
      >
        الرئيسية
      </button>
      <ChevronRight size={13} color="#C4C9DE" strokeWidth={2} style={{ flexShrink: 0 }} />
      <button
        onClick={onBack}
        style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9BA3C4")}
      >
        دوراتي
      </button>
      <ChevronRight size={13} color="#C4C9DE" strokeWidth={2} style={{ flexShrink: 0 }} />
      <span style={{ fontFamily: FONT, fontSize: 13, color: PRIMARY }}>تفاصيل الدورة</span>
    </div>
  );
}
