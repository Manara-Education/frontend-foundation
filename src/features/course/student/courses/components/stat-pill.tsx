import { FONT } from "../formatters/courses.formatter";

interface StatPillProps {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
}

export function StatPill({ icon: Icon, value, label, color }: StatPillProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "10px 14px",
        borderRadius: 16,
        background: `${color}08`,
        border: `1.5px solid ${color}14`,
        minWidth: 80,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 10,
          background: `${color}12`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        <Icon size={13} strokeWidth={2} />
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: "#1F2937", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: FONT, fontSize: 10, color: "#9BA3C4", lineHeight: 1.2, whiteSpace: "nowrap" }}>
        {label}
      </div>
    </div>
  );
}
