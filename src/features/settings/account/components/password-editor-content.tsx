import { Eye, EyeOff, Loader2 } from "lucide-react";
import { PasswordRequirements } from "@/features/auth/password-policy/password-requirements";
import { ActionButton } from "../../components/action-button";
import { EditorShell } from "../../components/editor-shell";
import { DANGER, FAINT, PRIMARY } from "../../components/settings-tokens";
import { UnsavedChangesDialog } from "../../components/unsaved-changes-dialog";
import type { PasswordEditorErrors, PasswordFieldId } from "../types/account.types";
import { TextField } from "./text-field";

const TIPS = [
  "بعد تغيير كلمة المرور سيُسجَّل خروجك من أجهزتك الأخرى، ويبقى هذا الجهاز متصلًا.",
  "استخدم عبارة طويلة يسهل عليك تذكّرها ويصعب على غيرك تخمينها.",
];

const FIELDS: readonly { id: PasswordFieldId; label: string; autoComplete: string }[] = [
  { id: "currentPassword", label: "كلمة المرور الحالية", autoComplete: "current-password" },
  { id: "newPassword", label: "كلمة المرور الجديدة", autoComplete: "new-password" },
  { id: "confirmPassword", label: "تأكيد كلمة المرور الجديدة", autoComplete: "new-password" },
];

interface PasswordEditorContentProps {
  values: Record<PasswordFieldId, string>;
  visible: Record<PasswordFieldId, boolean>;
  errors: PasswordEditorErrors;
  onChange: (field: PasswordFieldId, value: string) => void;
  toggleVisible: (field: PasswordFieldId) => void;
  strength: { met: number; total: number; label: string };
  saving: boolean;
  submit: () => void;
  close: () => void;
  confirmingLeave: boolean;
  stay: () => void;
  leave: () => void;
}

export function PasswordEditorContent(props: PasswordEditorContentProps) {
  const { values, visible, errors, onChange, toggleVisible, strength, saving, submit, close } = props;
  return (
    <>
      <EditorShell
        title="تغيير كلمة المرور"
        description="أدخل كلمة المرور الحالية ثم اختر كلمة مرور جديدة."
        tips={TIPS}
        onClose={close}
        footer={
          <>
            <ActionButton onClick={submit} disabled={saving} aria-busy={saving || undefined}>
              {saving ? <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden /> : null}
              {saving ? "جارٍ التغيير…" : "تغيير كلمة المرور"}
            </ActionButton>
            <ActionButton variant="secondary" onClick={close} disabled={saving}>إلغاء</ActionButton>
          </>
        }
      >
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          {FIELDS.map((field) => (
            <div key={field.id} className="flex flex-col gap-3">
              <TextField
                id={`settings-${field.id}`}
                label={field.label}
                type={visible[field.id] ? "text" : "password"}
                value={values[field.id]}
                onChange={(value) => onChange(field.id, value)}
                error={errors[field.id]}
                autoComplete={field.autoComplete}
                disabled={saving}
                describedBy={field.id === "newPassword" ? "settings-password-rules" : undefined}
                trailing={
                  <button
                    type="button"
                    onClick={() => toggleVisible(field.id)}
                    aria-label={visible[field.id] ? `إخفاء ${field.label}` : `إظهار ${field.label}`}
                    aria-pressed={visible[field.id]}
                    className="flex items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
                    style={{ width: 34, height: 34, background: "transparent", border: "none", color: FAINT, cursor: "pointer" }}
                  >
                    {visible[field.id] ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                  </button>
                }
              />
              {field.id === "newPassword" ? (
                <>
                  <StrengthMeter {...strength} />
                  <PasswordRequirements password={values.newPassword} id="settings-password-rules" />
                </>
              ) : null}
            </div>
          ))}
          {/* Lets Enter submit from any field. */}
          <button type="submit" hidden aria-hidden tabIndex={-1} />
        </form>
        {errors.general ? <p role="alert" style={{ fontSize: 13, color: DANGER }}>{errors.general}</p> : null}
      </EditorShell>
      <UnsavedChangesDialog open={props.confirmingLeave} onStay={props.stay} onLeave={props.leave} />
    </>
  );
}

function StrengthMeter({ met, total, label }: { met: number; total: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        role="meter"
        aria-label="قوة كلمة المرور"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={met}
        aria-valuetext={label || "لم تُدخل بعد"}
        className="flex flex-1 gap-1"
      >
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className="h-1.5 flex-1 rounded-full"
            style={{ background: index < met ? (met === total ? "#27AE60" : PRIMARY) : "rgba(78,91,146,0.12)" }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: FAINT, minWidth: 44 }}>{label}</span>
    </div>
  );
}
