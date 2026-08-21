import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Clock, CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import type { SubscriptionPlanEditorState, SubscriptionUnit } from "@/shared/courses";
import {
  formatPlanSummary,
  formatSubscriptionUnitLabel,
} from "../formatters/course-editor.formatter";
import type { CourseEditorSurface, SubscriptionPlanDraft } from "../types/course-editor.types";
import { Field } from "./field";
import { FONT, PRIMARY, inputStyle } from "./editor-theme";

const UNIT_OPTIONS: { value: SubscriptionUnit; label: string }[] = [
  { value: "DAY", label: "يوم" },
  { value: "WEEK", label: "أسبوع" },
  { value: "MONTH", label: "شهر" },
];

// ── One-off purchase ──────────────────────────────────────────────────────────

export function PurchasePricing({
  price,
  onPriceChange,
  error,
}: {
  price: string;
  onPriceChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="سعر الدورة" required error={error}>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            placeholder="مثال: 500"
            style={{ ...inputStyle(!!price, !!error), direction: "ltr", maxWidth: 200 }}
          />
          <span style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4" }}>جنيه مصري (ج.م)</span>
        </div>
      </Field>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: 12,
          background: "rgba(78,91,146,0.04)",
          border: "1px solid rgba(78,91,146,0.10)",
        }}
      >
        <Check size={14} color={PRIMARY} />
        <span style={{ fontFamily: FONT, fontSize: 12, color: "#717182" }}>
          وصول دائم — يدفع الطالب مرة واحدة فقط
        </span>
      </div>
    </div>
  );
}

// ── Plan rows ─────────────────────────────────────────────────────────────────

function PlanRow({
  plan,
  onEdit,
  onDelete,
}: {
  plan: SubscriptionPlanEditorState;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 14,
        background: "#fff",
        border: "1.5px solid rgba(78,91,146,0.10)",
        marginBottom: 8,
      }}
    >
      <div
        className="rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ width: 38, height: 38, background: "rgba(78,91,146,0.08)", color: PRIMARY }}
      >
        <Clock size={16} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT, fontSize: 14, color: "#1E2340" }}>
          {plan.name || `${plan.duration} ${formatSubscriptionUnitLabel(plan.unit)}`}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>
          {formatPlanSummary(plan.duration, plan.unit, plan.price)}
        </div>
      </div>
      <button
        onClick={onEdit}
        style={{
          padding: "5px 12px",
          borderRadius: 10,
          background: "rgba(78,91,146,0.07)",
          border: "none",
          cursor: "pointer",
          fontFamily: FONT,
          fontSize: 12,
          color: PRIMARY,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(78,91,146,0.12)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(78,91,146,0.07)")}
      >
        تعديل
      </button>
      <button
        onClick={onDelete}
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          background: "rgba(212,24,61,0.07)",
          border: "none",
          cursor: "pointer",
          color: "#D4183D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,24,61,0.14)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(212,24,61,0.07)")}
      >
        <Trash2 size={13} />
      </button>
    </motion.div>
  );
}

function CompactPlanRow({
  plan,
  onEdit,
  onDelete,
}: {
  plan: SubscriptionPlanEditorState;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: "#FAFBFD",
        border: "1.5px solid rgba(78,91,146,0.1)",
        marginBottom: 6,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          background: "rgba(78,91,146,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <CreditCard size={13} style={{ color: PRIMARY }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT, fontSize: 13, color: "#1E2340" }}>{plan.name}</div>
        <div style={{ fontFamily: FONT, fontSize: 11, color: "#9BA3C4" }}>
          {formatPlanSummary(plan.duration, plan.unit, plan.price)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {(
          [
            { fn: onEdit, ic: Pencil, hc: PRIMARY },
            { fn: onDelete, ic: Trash2, hc: "#D4183D" },
          ] as const
        ).map(({ fn, ic: Ic, hc }, idx) => (
          <button
            key={idx}
            onClick={fn}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9BA3C4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = hc;
              e.currentTarget.style.background = `${hc}12`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9BA3C4";
              e.currentTarget.style.background = "none";
            }}
          >
            <Ic size={12} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Inline plan form ──────────────────────────────────────────────────────────

function InlinePlanForm({
  initialData,
  onSave,
  onClose,
}: {
  initialData?: SubscriptionPlanEditorState;
  onSave: (draft: SubscriptionPlanDraft) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [duration, setDuration] = useState(String(initialData?.duration ?? 30));
  const [unit, setUnit] = useState<SubscriptionUnit>(initialData?.unit ?? "DAY");
  const [price, setPrice] = useState(initialData ? String(initialData.price) : "");
  const [priceErr, setPriceErr] = useState("");

  function handleSave() {
    const parsed = parseFloat(price);
    if (isNaN(parsed) || parsed <= 0) {
      setPriceErr("السعر مطلوب ويجب أن يكون موجباً");
      return;
    }
    onSave({
      name: name.trim() || `اشتراك ${duration} ${formatSubscriptionUnitLabel(unit)}`,
      duration: Number(duration) || 30,
      unit,
      price: parsed,
    });
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      style={{ overflow: "hidden" }}
    >
      <div
        style={{
          border: "1.5px solid rgba(78,91,146,0.18)",
          borderRadius: 18,
          padding: "22px 22px 20px",
          marginTop: 4,
          background: "rgba(78,91,146,0.02)",
        }}
      >
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "#1E2340", marginBottom: 16 }}>
          {initialData ? "تعديل خطة الاشتراك" : "إضافة خطة اشتراك"}
        </div>
        <div className="flex flex-col gap-4">
          <Field label="اسم الخطة">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: اشتراك شهري"
              style={inputStyle(!!name)}
            />
          </Field>

          <Field label="مدة الوصول">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{ ...inputStyle(!!duration), width: 100, direction: "ltr" }}
              />
              <div className="flex gap-2">
                {UNIT_OPTIONS.map(({ value: v, label }) => (
                  <button
                    key={v}
                    onClick={() => setUnit(v)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${unit === v ? PRIMARY : "rgba(78,91,146,0.14)"}`,
                      background: unit === v ? "rgba(78,91,146,0.09)" : "transparent",
                      cursor: "pointer",
                      fontFamily: FONT,
                      fontSize: 12,
                      color: unit === v ? PRIMARY : "#717182",
                      fontWeight: unit === v ? 600 : 400,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Field>

          <Field label="السعر" required error={priceErr}>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setPriceErr("");
                }}
                placeholder="مثال: 250"
                style={{ ...inputStyle(!!price, !!priceErr), direction: "ltr", width: "100%" }}
              />
              <span style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4", flexShrink: 0 }}>ج.م</span>
            </div>
          </Field>
        </div>
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleSave}
            style={{
              height: 40,
              paddingLeft: 22,
              paddingRight: 22,
              borderRadius: 12,
              background: PRIMARY,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {initialData ? "حفظ التعديلات" : "إضافة الخطة"}
          </button>
          <button
            onClick={onClose}
            style={{
              height: 40,
              paddingLeft: 18,
              paddingRight: 18,
              borderRadius: 12,
              background: "transparent",
              color: "#717182",
              border: "1.5px solid rgba(78,91,146,0.18)",
              cursor: "pointer",
              fontFamily: FONT,
              fontSize: 13,
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

interface SubscriptionPlansSectionProps {
  plans: SubscriptionPlanEditorState[];
  onAdd: (draft: SubscriptionPlanDraft) => void;
  onUpdate: (key: string, draft: SubscriptionPlanDraft) => void;
  onDelete: (key: string) => void;
  variant?: CourseEditorSurface;
  error?: string;
}

/**
 * Subscription plan management, shared by the wizard's pricing step and the course
 * editor's pricing tab. The two differ in row chrome and in the editor's three-plan
 * cap; the plan form itself is the same one in both.
 */
export function SubscriptionPlansSection({
  plans,
  onAdd,
  onUpdate,
  onDelete,
  variant = "wizard",
  error,
}: SubscriptionPlansSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);

  const editingPlan = editKey ? plans.find((p) => p.key === editKey) : undefined;
  const isTabs = variant === "tabs";
  const canAdd = !isTabs || plans.length < 3;

  function openAdd() {
    setEditKey(null);
    setFormOpen(true);
  }

  function openEdit(key: string) {
    setEditKey(key);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditKey(null);
  }

  function handleSave(draft: SubscriptionPlanDraft) {
    if (editKey) onUpdate(editKey, draft);
    else onAdd(draft);
  }

  const Row = isTabs ? CompactPlanRow : PlanRow;

  return (
    <div>
      {!isTabs && (
        <>
          <div style={{ fontFamily: FONT, fontSize: 13.5, color: "#1E2340", marginBottom: 4 }}>خطط الاشتراك</div>
          <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", marginBottom: 16, lineHeight: 1.6 }}>
            أضف خطط اشتراك بمدد مختلفة. كلما زادت الخيارات، زادت فرصة الطالب في الانضمام.
          </div>
        </>
      )}

      {plans.length > 0 && (
        <div>
          {plans.map((plan) => (
            <Row key={plan.key} plan={plan} onEdit={() => openEdit(plan.key)} onDelete={() => onDelete(plan.key)} />
          ))}
        </div>
      )}

      {!isTabs && plans.length === 0 && !formOpen && (
        <div
          style={{
            border: "1.5px dashed rgba(78,91,146,0.18)",
            borderRadius: 14,
            padding: "22px",
            textAlign: "center",
            background: "rgba(78,91,146,0.02)",
            marginBottom: 12,
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4" }}>أضف خطة اشتراك واحدة على الأقل</div>
        </div>
      )}

      <AnimatePresence>
        {formOpen && (
          <InlinePlanForm key={editKey ?? "add"} initialData={editingPlan} onSave={handleSave} onClose={closeForm} />
        )}
      </AnimatePresence>

      {!formOpen && canAdd && (
        <button
          onClick={openAdd}
          style={
            isTabs
              ? {
                  width: "100%",
                  height: 38,
                  borderRadius: 11,
                  border: "1.5px dashed rgba(78,91,146,0.2)",
                  background: "transparent",
                  color: "#9BA3C4",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }
              : {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                  padding: "10px 18px",
                  borderRadius: 14,
                  border: "1.5px dashed rgba(78,91,146,0.25)",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontSize: 13,
                  color: PRIMARY,
                }
          }
          onMouseEnter={(e) => {
            if (isTabs) {
              e.currentTarget.style.borderColor = PRIMARY;
              e.currentTarget.style.color = PRIMARY;
            } else {
              e.currentTarget.style.background = "rgba(78,91,146,0.05)";
            }
          }}
          onMouseLeave={(e) => {
            if (isTabs) {
              e.currentTarget.style.borderColor = "rgba(78,91,146,0.2)";
              e.currentTarget.style.color = "#9BA3C4";
            } else {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          <Plus size={isTabs ? 13 : 15} /> إضافة خطة اشتراك
        </button>
      )}

      {error && (
        <p style={{ fontFamily: FONT, fontSize: isTabs ? 11.5 : 12, color: "#D4183D", marginTop: isTabs ? 0 : 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}
