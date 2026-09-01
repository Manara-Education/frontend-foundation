import { AlignLeft, Layers } from "lucide-react";
import type { CourseStructure } from "@/shared/courses";
import { FONT, PRIMARY } from "./editor-theme";

const OPTIONS: { value: CourseStructure; icon: React.ElementType; title: string; desc: string }[] = [
  {
    value: "FLAT",
    icon: AlignLeft,
    title: "دروس مباشرة",
    desc: "أضف الدروس مباشرة إلى الدورة بدون تقسيمها إلى وحدات.",
  },
  {
    value: "MODULES",
    icon: Layers,
    title: "وحدات ودروس",
    desc: "قسّم محتوى الدورة إلى وحدات، وكل وحدة تحتوي على مجموعة من الدروس ويمكن أن تحتوي على اختبار.",
  },
];

/**
 * The create wizard's structure picker. Switching only changes which branch of the
 * editor is shown — both keep whatever has already been entered.
 */
export function StructureSection({
  value,
  onChange,
}: {
  value: CourseStructure;
  onChange: (value: CourseStructure) => void;
}) {
  return (
    <div className="rs-grid" style={{ "--rs-grid-min": "220px", "--rs-grid-gap": "16px" } as React.CSSProperties}>
      {OPTIONS.map(({ value: v, icon: Icon, title, desc }) => {
        const active = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              padding: "18px 20px",
              borderRadius: 18,
              textAlign: "right",
              border: `2px solid ${active ? PRIMARY : "rgba(78,91,146,0.14)"}`,
              background: active ? "rgba(78,91,146,0.06)" : "rgba(78,91,146,0.01)",
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: active ? "0 0 0 4px rgba(78,91,146,0.1)" : "none",
              minWidth: 0,
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.borderColor = "rgba(78,91,146,0.3)";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.borderColor = "rgba(78,91,146,0.14)";
            }}
          >
            <div className="flex items-start gap-3" style={{ minWidth: 0 }}>
              <div
                className="rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  background: active ? PRIMARY : "rgba(78,91,146,0.09)",
                  color: active ? "#fff" : "#9BA3C4",
                }}
              >
                <Icon size={18} />
              </div>
              <div className="rs-longform" style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="rs-longform"
                  style={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 14,
                    color: active ? PRIMARY : "#1E2340",
                    marginBottom: 4,
                  }}
                >
                  {active && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: PRIMARY,
                        marginInlineEnd: 6,
                        verticalAlign: "middle",
                      }}
                    />
                  )}
                  {title}
                </div>
                <div className="rs-longform" style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const TAB_OPTIONS: [CourseStructure, string, string][] = [
  ["FLAT", "دروس مباشرة", "ترتيب خطي بدون وحدات"],
  ["MODULES", "وحدات ودروس", "وحدات تحتوي مجموعات دروس"],
];

/** The same choice as rendered in the course editor's overview tab. */
export function StructureRadioRow({
  value,
  onChange,
}: {
  value: CourseStructure;
  onChange: (value: CourseStructure) => void;
}) {
  return (
    <div className="rs-grid" style={{ "--rs-grid-min": "170px", "--rs-grid-gap": "10px" } as React.CSSProperties}>
      {TAB_OPTIONS.map(([v, label, sub]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            padding: "11px 14px",
            minHeight: 44,
            borderRadius: 14,
            border: `1.5px solid ${value === v ? PRIMARY : "rgba(78,91,146,0.14)"}`,
            background: value === v ? "rgba(78,91,146,0.06)" : "#FAFBFD",
            cursor: "pointer",
            textAlign: "right" as const,
            transition: "all 0.15s",
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, minWidth: 0 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 99,
                border: `2px solid ${value === v ? PRIMARY : "rgba(78,91,146,0.3)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {value === v && <div style={{ width: 6, height: 6, borderRadius: 99, background: PRIMARY }} />}
            </div>
            <span
              className="rs-longform"
              style={{
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: value === v ? 700 : 500,
                color: value === v ? PRIMARY : "#1E2340",
              }}
            >
              {label}
            </span>
          </div>
          <div className="rs-longform" style={{ fontFamily: FONT, fontSize: 10.5, color: "#9BA3C4", marginInlineStart: 20 }}>{sub}</div>
        </button>
      ))}
    </div>
  );
}
