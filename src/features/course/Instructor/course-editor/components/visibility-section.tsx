import type { CSSProperties } from "react";
import { Globe, Lock } from "lucide-react";
import type { CourseVisibility } from "@/shared/courses";
import { FONT, PRIMARY } from "./editor-theme";

/**
 * Who the course is offered to — the second axis, drawn beside publication rather than
 * folded into it.
 *
 * The wording matters as much as the control. "Private" here does not mean unfinished and
 * does not mean unpublished: a published private course is a real, complete course that
 * simply is not on the catalogue. The descriptions say so explicitly, because the one
 * mistake an instructor can make with this control is assuming it will take the course away
 * from the students already in it — and the answer, stated in the copy and enforced on the
 * server, is that it will not.
 *
 * Two renderings of one choice, mirroring `structure-section.tsx`: the tall cards for the
 * create wizard, and the compact radio row for the editor's overview tab.
 */

interface VisibilityOption {
  value: CourseVisibility;
  icon: React.ElementType;
  title: string;
  desc: string;
}

const OPTIONS: VisibilityOption[] = [
  {
    value: "PUBLIC",
    icon: Globe,
    title: "عامة",
    desc: "تظهر الدورة في استكشاف الدورات والبحث لكل الطلاب، حسب حالة نشرها.",
  },
  {
    value: "PRIVATE",
    icon: Lock,
    title: "خاصة",
    desc: "لا تظهر الدورة في الاستكشاف أو البحث. يصل إليها الطلاب المشتركون فيها بالفعل والمعلم فقط، ويحتفظ كل طالب مشترك بتقدمه واشتراكه كما هو.",
  },
];

/** The create wizard's visibility picker. */
export function VisibilitySection({
  value,
  onChange,
}: {
  value: CourseVisibility;
  onChange: (value: CourseVisibility) => void;
}) {
  return (
    <div className="rs-grid" style={{ "--rs-grid-min": "260px", "--rs-grid-gap": "16px" } as CSSProperties}>
      {OPTIONS.map(({ value: v, icon: Icon, title, desc }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={title}
            onClick={() => onChange(v)}
            style={{
              flex: 1,
              padding: "18px 20px",
              borderRadius: 18,
              textAlign: "right",
              border: `2px solid ${active ? PRIMARY : "rgba(78,91,146,0.14)"}`,
              background: active ? "rgba(78,91,146,0.06)" : "rgba(78,91,146,0.01)",
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: active ? "0 0 0 4px rgba(78,91,146,0.1)" : "none",
              minHeight: 88,
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
                  width: 38,
                  height: 38,
                  background: active ? PRIMARY : "rgba(78,91,146,0.09)",
                  color: active ? "#fff" : "#9BA3C4",
                }}
              >
                <Icon size={18} />
              </div>
              <div className="rs-longform" style={{ flex: 1, minWidth: 0 }}>
                <div
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
                        marginLeft: 6,
                        verticalAlign: "middle",
                      }}
                    />
                  )}
                  {title}
                </div>
                <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", lineHeight: 1.6 }}>
                  {desc}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const TAB_OPTIONS: [CourseVisibility, string, string][] = [
  ["PUBLIC", "عامة", "تظهر في الاستكشاف والبحث"],
  ["PRIVATE", "خاصة", "للطلاب المشتركين فيها فقط"],
];

/**
 * The same choice as rendered in the course editor's overview tab.
 *
 * Sits directly under the structure row and directly beside the publish control, which is
 * the layout that makes the independence legible: an instructor can see at a glance that
 * their course is منشورة and خاصة at the same time.
 */
export function VisibilityRadioRow({
  value,
  onChange,
}: {
  value: CourseVisibility;
  onChange: (value: CourseVisibility) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }} role="radiogroup" aria-label="ظهور الدورة">
      {TAB_OPTIONS.map(([v, label, sub]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          aria-label={label}
          onClick={() => onChange(v)}
          style={{
            flex: "1 1 min(140px, 100%)",
            minHeight: 44,
            padding: "11px 14px",
            borderRadius: 14,
            border: `1.5px solid ${value === v ? PRIMARY : "rgba(78,91,146,0.14)"}`,
            background: value === v ? "rgba(78,91,146,0.06)" : "#FAFBFD",
            cursor: "pointer",
            textAlign: "right" as const,
            transition: "all 0.15s",
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
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
              {value === v && (
                <div style={{ width: 6, height: 6, borderRadius: 99, background: PRIMARY }} />
              )}
            </div>
            <span
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
          <div className="rs-longform" style={{ fontFamily: FONT, fontSize: 10.5, color: "#9BA3C4", marginInlineStart: 20 }}>
            {sub}
          </div>
        </button>
      ))}
    </div>
  );
}
