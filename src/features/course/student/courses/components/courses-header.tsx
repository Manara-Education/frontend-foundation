import { BookOpen, CheckCircle2, Clock3, LayoutGrid } from "lucide-react";
import { FONT, PRIMARY, SUCCESS, WARNING } from "../formatters/courses.formatter";
import { StatPill } from "./stat-pill";

interface CoursesHeaderProps {
  total: number;
  completed: number;
  inProgress: number;
}

export function CoursesHeader({ total, completed, inProgress }: CoursesHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 20,
        marginBottom: 32,
      }}
    >
      {/* Title */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: `rgba(78,91,146,0.10)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PRIMARY,
            }}
          >
            <BookOpen size={18} strokeWidth={1.8} />
          </div>
          <h1
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 28,
              color: "#1F2937",
              lineHeight: 1,
              margin: 0,
            }}
          >
            دوراتي
          </h1>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 14, color: "#9BA3C4", margin: 0, paddingRight: 48 }}>
          تابع تقدمك واستكمل رحلتك التعليمية
        </p>
      </div>

      {/* Stats pills */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <StatPill icon={LayoutGrid}   value={total}      label="إجمالي الدورات"   color={PRIMARY} />
        <StatPill icon={CheckCircle2} value={completed}  label="الدورات المكتملة" color={SUCCESS} />
        <StatPill icon={Clock3}       value={inProgress} label="قيد التقدم"        color={WARNING} />
      </div>
    </div>
  );
}
