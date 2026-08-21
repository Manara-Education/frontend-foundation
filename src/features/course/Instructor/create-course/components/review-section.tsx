import { motion } from "motion/react";
import type { CourseEditorState } from "@/shared/courses";
import {
  formatAccessSummary,
  formatStructureLabel,
  formatSubscriptionUnitLabel,
} from "@/features/course/Instructor/course-editor/formatters/course-editor.formatter";
import { FONT, PRIMARY } from "@/features/course/Instructor/course-editor/components/editor-theme";
import type { StepId } from "./step-indicator";

function ReviewCard({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1.5px solid rgba(78,91,146,0.09)",
        padding: "20px 24px",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14.5, color: "#1E2340" }}>{label}</div>
        <button
          onClick={onEdit}
          style={{
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 600,
            color: PRIMARY,
            background: "rgba(78,91,146,0.07)",
            border: "none",
            borderRadius: 9,
            padding: "5px 12px",
            cursor: "pointer",
          }}
        >
          تعديل
        </button>
      </div>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
      <span style={{ fontFamily: FONT, fontSize: 12.5, color: "#9BA3C4", minWidth: 80, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: FONT, fontSize: 12.5, color: "#1E2340", flex: 1 }}>{value || "—"}</span>
    </div>
  );
}

interface ReviewSectionProps {
  state: CourseEditorState;
  purchasePrice: string;
  hasCoverImage: boolean;
  onGoToStep: (step: StepId) => void;
}

/** The wizard's last step: a read-only summary with shortcuts back to each section. */
export function ReviewSection({ state, purchasePrice, hasCoverImage, onGoToStep }: ReviewSectionProps) {
  const isFlat = state.structure === "FLAT";
  const totalLessons = isFlat
    ? state.lessons.length
    : state.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalExams = isFlat
    ? state.lessons.filter((l) => l.quiz).length + (state.finalQuiz ? 1 : 0)
    : state.modules.filter((m) => m.quiz).length +
      state.modules.reduce((sum, m) => sum + m.lessons.filter((l) => l.quiz).length, 0) +
      (state.finalQuiz ? 1 : 0);

  const accessLabel = formatAccessSummary(
    state.accessType,
    purchasePrice,
    state.subscriptionPlans.length,
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div
        style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#9BA3C4", marginBottom: 16, letterSpacing: 0.5 }}
      >
        مراجعة التفاصيل قبل النشر
      </div>

      <ReviewCard label="معلومات الدورة" onEdit={() => onGoToStep(1)}>
        <ReviewRow label="العنوان" value={state.title} />
        <ReviewRow
          label="الوصف"
          value={state.description.slice(0, 100) + (state.description.length > 100 ? "..." : "")}
        />
        <ReviewRow label="الغلاف" value={hasCoverImage ? "تم رفع صورة" : "لا توجد صورة"} />
      </ReviewCard>

      <ReviewCard label="المحتوى التعليمي" onEdit={() => onGoToStep(3)}>
        <ReviewRow label="التنظيم" value={formatStructureLabel(state.structure)} />
        {!isFlat && <ReviewRow label="الوحدات" value={`${state.modules.length} وحدة`} />}
        <ReviewRow label="الدروس" value={`${totalLessons} درس`} />
        {totalExams > 0 && <ReviewRow label="الاختبارات" value={`${totalExams} اختبار`} />}
      </ReviewCard>

      <ReviewCard label="طريقة الوصول" onEdit={() => onGoToStep(5)}>
        <ReviewRow label="النوع" value={accessLabel} />
        {state.accessType === "SUBSCRIPTION" && state.subscriptionPlans.length > 0 && (
          <div style={{ marginTop: 6 }}>
            {state.subscriptionPlans.map((p) => (
              <div key={p.key} style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", marginBottom: 3 }}>
                • {p.name}: {p.duration} {formatSubscriptionUnitLabel(p.unit)} — {p.price} ج.م
              </div>
            ))}
          </div>
        )}
      </ReviewCard>
    </motion.div>
  );
}
