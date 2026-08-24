import { ChevronRight } from "lucide-react";
import { FONT, PRIMARY } from "./lesson.constants";

interface LPBreadcrumbProps {
  onHome: () => void;
  onCourses: () => void;
  onCourseDetails: () => void;
  lessonTitle: string;
}

export function LPBreadcrumb({
  onHome,
  onCourses,
  onCourseDetails,
  lessonTitle,
}: LPBreadcrumbProps) {
  const crumbs = [
    { label: "الرئيسية", onClick: onHome },
    { label: "دوراتي", onClick: onCourses },
    { label: "تفاصيل الدورة", onClick: onCourseDetails },
  ];

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        marginBottom: 22,
        flexWrap: "wrap",
      }}
    >
      {crumbs.map((c) => (
        <span key={c.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <button
            onClick={c.onClick}
            style={{
              fontFamily: FONT,
              fontSize: 12,
              color: "#9BA3C4",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9BA3C4")}
          >
            {c.label}
          </button>
          <ChevronRight size={11} color="#D0D4E8" strokeWidth={2} style={{ flexShrink: 0 }} />
        </span>
      ))}
      <span
        style={{
          fontFamily: FONT,
          fontSize: 12,
          color: PRIMARY,
          maxWidth: 200,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {lessonTitle}
      </span>
    </div>
  );
}
