import { Clock, CreditCard, Star } from "lucide-react";
import type { CourseAccessType } from "@/shared/courses";
import { FONT, PRIMARY } from "./editor-theme";

const OPTIONS: { value: CourseAccessType; icon: React.ElementType; title: string; desc: string }[] = [
  { value: "FREE", icon: Star, title: "مجانية", desc: "يمكن للطلاب الانضمام إلى الدورة مجاناً." },
  {
    value: "PURCHASE",
    icon: CreditCard,
    title: "شراء مرة واحدة",
    desc: "يدفع الطالب مرة واحدة للحصول على الوصول الدائم.",
  },
  {
    value: "SUBSCRIPTION",
    icon: Clock,
    title: "اشتراك لمدة محددة",
    desc: "يدفع الطالب مقابل الوصول لفترة زمنية محددة.",
  },
];

/** The create wizard's access picker. */
export function AccessTypeSection({
  value,
  onChange,
}: {
  value: CourseAccessType;
  onChange: (value: CourseAccessType) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {OPTIONS.map(({ value: v, icon: Icon, title, desc }) => {
        const active = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
              borderRadius: 16,
              border: `2px solid ${active ? PRIMARY : "rgba(78,91,146,0.12)"}`,
              background: active ? "rgba(78,91,146,0.05)" : "transparent",
              cursor: "pointer",
              textAlign: "right",
              transition: "all 0.15s",
              boxShadow: active ? "0 0 0 3px rgba(78,91,146,0.10)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.borderColor = "rgba(78,91,146,0.28)";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.borderColor = "rgba(78,91,146,0.12)";
            }}
          >
            {/* Radio dot */}
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: `2px solid ${active ? PRIMARY : "rgba(78,91,146,0.25)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {active && <div style={{ width: 10, height: 10, borderRadius: "50%", background: PRIMARY }} />}
            </div>

            <div
              className="rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                width: 38,
                height: 38,
                background: active ? PRIMARY : "rgba(78,91,146,0.08)",
                color: active ? "#fff" : "#9BA3C4",
              }}
            >
              <Icon size={17} />
            </div>

            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: active ? PRIMARY : "#1E2340" }}>
                {title}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", lineHeight: 1.6 }}>{desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const TAB_OPTIONS: [CourseAccessType, string, string][] = [
  ["FREE", "مجاني", "بدون رسوم"],
  ["PURCHASE", "شراء", "سعر ثابت"],
  ["SUBSCRIPTION", "اشتراك", "خطط متعددة"],
];

/** The same choice, as the compact row in the course editor's pricing tab. */
export function AccessTypeRow({
  value,
  onChange,
}: {
  value: CourseAccessType;
  onChange: (value: CourseAccessType) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {TAB_OPTIONS.map(([v, label, sub]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            flex: 1,
            padding: "11px 10px",
            borderRadius: 13,
            border: `1.5px solid ${value === v ? PRIMARY : "rgba(78,91,146,0.14)"}`,
            background: value === v ? "rgba(78,91,146,0.06)" : "#FAFBFD",
            cursor: "pointer",
            textAlign: "center" as const,
            transition: "all 0.15s",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: value === v ? 700 : 500,
              color: value === v ? PRIMARY : "#1E2340",
            }}
          >
            {label}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4", marginTop: 2 }}>{sub}</div>
        </button>
      ))}
    </div>
  );
}
