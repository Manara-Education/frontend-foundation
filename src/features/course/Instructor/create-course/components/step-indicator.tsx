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
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 2 }}>
        {STEPS.map((step, idx) => {
          const done = step.id < current;
          const active = step.id === current;
          const Ic = step.icon;
          return (
            <div
              key={step.id}
              style={{ display: "flex", alignItems: "center", flex: idx < STEPS.length - 1 ? "none" : undefined }}
            >
              <button
                onClick={() => {
                  if (done || active) onGoTo(step.id);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  background: "none",
                  border: "none",
                  cursor: done ? "pointer" : "default",
                  padding: "4px 6px",
                  outline: "none",
                  minWidth: 68,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: done ? PRIMARY : active ? PRIMARY : "rgba(78,91,146,0.08)",
                    color: done || active ? "#fff" : "#C4C9DC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: active ? "0 4px 14px rgba(78,91,146,0.32)" : "none",
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                >
                  {done ? <CheckCircle size={15} /> : <Ic size={15} />}
                </div>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 10.5,
                    fontWeight: active ? 700 : 500,
                    whiteSpace: "nowrap",
                    color: done ? PRIMARY : active ? PRIMARY : "#B0B7D4",
                  }}
                >
                  {step.label}
                </span>
              </button>
              {idx < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    minWidth: 16,
                    height: 2,
                    borderRadius: 1,
                    background: done ? PRIMARY : "rgba(78,91,146,0.12)",
                    margin: "0 2px",
                    marginBottom: 22,
                    transition: "background 0.2s",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
