import { ChevronRight } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/course-details.formatter";
import type { CourseDetailsMode } from "../types/course-details.types";

interface BreadcrumbProps {
  /** The section this course was opened from — "دوراتي" or "استكشاف الدورات". */
  onBack: () => void;
  /** The learner's home. Distinct from `onBack`: browsing the catalogue is not home. */
  onHome?: () => void;
  mode: CourseDetailsMode;
}

export function Breadcrumb({ onBack, onHome, mode }: BreadcrumbProps) {
  const goHome = onHome ?? onBack;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
      <button
        onClick={goHome}
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
        {mode === "browse" ? "استكشاف الدورات" : "دوراتي"}
      </button>
      <ChevronRight size={13} color="#C4C9DE" strokeWidth={2} style={{ flexShrink: 0 }} />
      <span style={{ fontFamily: FONT, fontSize: 13, color: PRIMARY }}>تفاصيل الدورة</span>
    </div>
  );
}
