import { AlignLeft, Award, BookOpen, CheckCircle, CreditCard, Layers } from "lucide-react";
import { FONT, PRIMARY } from "@/features/course/Instructor/course-editor/components/editor-theme";

export const STEPS = [
  { id: 1, label: "معلومات الدورة", icon: BookOpen },
  { id: 2, label: "تنظيم المحتوى", icon: Layers },
  { id: 3, label: "المحتوى", icon: AlignLeft },
  { id: 4, label: "الاختبارات", icon: Award },
  { id: 5, label: "السعر والوصول", icon: CreditCard },
  { id: 6, label: "المراجعة والنشر", icon: CheckCircle },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

/** The wizard's progress rail. Completed steps are clickable, later ones are not. */
export function StepIndicator({ current, onGoTo }: { current: StepId; onGoTo: (step: StepId) => void }) {
  const currentStep = STEPS.find((step) => step.id === current) ?? STEPS[0];

  return (
    <nav
      aria-label="مراحل إنشاء الدورة"
      className="rs-longform"
      style={{ marginBlockEnd: 24, minInlineSize: 0 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginBlockEnd: 10,
          minInlineSize: 0,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 12.5,
            fontWeight: 700,
            color: PRIMARY,
            background: "rgba(78,91,146,0.08)",
            borderRadius: 999,
            paddingBlock: 5,
            paddingInline: 12,
            minBlockSize: 44,
            display: "flex",
            alignItems: "center",
          }}
        >
          الخطوة {current} من {STEPS.length}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 700,
            color: "#1E2340",
            lineHeight: 1.5,
            minInlineSize: 0,
            overflowWrap: "anywhere",
          }}
        >
          {currentStep.label}
        </div>
      </div>

      <div
        className="rs-grid"
        style={
          {
            "--rs-grid-min": "108px",
            "--rs-grid-gap": "8px",
          } as React.CSSProperties
        }
      >
        {STEPS.map((step, idx) => {
          const done = step.id < current;
          const active = step.id === current;
          const Ic = step.icon;
          return (
            <button
              key={step.id}
              type="button"
              className="rs-touch"
              aria-current={active ? "step" : undefined}
              aria-disabled={!done && !active}
              disabled={!done && !active}
              onClick={() => {
                if (done || active) onGoTo(step.id);
              }}
              style={{
                width: "100%",
                minHeight: 68,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: active ? "rgba(78,91,146,0.07)" : done ? "rgba(78,91,146,0.035)" : "#FAFBFD",
                border: `1.5px solid ${active ? "rgba(78,91,146,0.36)" : done ? "rgba(78,91,146,0.16)" : "rgba(78,91,146,0.08)"}`,
                borderRadius: 14,
                cursor: done ? "pointer" : "default",
                paddingBlock: 9,
                paddingInline: 8,
                outline: "none",
                minInlineSize: 0,
                textAlign: "start",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 11,
                  background: done ? PRIMARY : active ? PRIMARY : "rgba(78,91,146,0.08)",
                  color: done || active ? "#fff" : "#C4C9DC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: active ? "0 4px 14px rgba(78,91,146,0.28)" : "none",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                {done ? <CheckCircle size={15} /> : <Ic size={15} />}
              </div>
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minInlineSize: 0 }}>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 11.5,
                    fontWeight: active ? 700 : 500,
                    color: done ? PRIMARY : active ? PRIMARY : "#B0B7D4",
                    lineHeight: 1.35,
                    overflowWrap: "anywhere",
                  }}
                >
                  {step.label}
                </span>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 10,
                    fontWeight: 600,
                    color: active ? PRIMARY : done ? "#717182" : "#C4C9DC",
                    lineHeight: 1.35,
                  }}
                >
                  {active ? "الحالية" : done ? "مكتملة" : `بعد ${idx + 1 - current}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
