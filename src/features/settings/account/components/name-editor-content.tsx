import { Loader2 } from "lucide-react";
import { Skeleton } from "@/shared/components/skeleton";
import { ActionButton } from "../../components/action-button";
import { EditorShell } from "../../components/editor-shell";
import { DANGER } from "../../components/settings-tokens";
import { UnsavedChangesDialog } from "../../components/unsaved-changes-dialog";
import { FULL_NAME_MAX_LENGTH } from "../formatters/account.formatter";
import type { LoadState, NameEditorErrors } from "../types/account.types";
import { LoadFailure } from "./load-failure";
import { TextField } from "./text-field";

const TIPS = [
  "اكتب اسمك كما تريد أن يظهر في شهاداتك ولمدرّبيك.",
  `الحد الأقصى ${FULL_NAME_MAX_LENGTH} حرفًا، وتُحذف المسافات الزائدة في البداية والنهاية.`,
];

interface NameEditorContentProps {
  loadState: LoadState;
  retryLoad: () => void;
  value: string;
  onChange: (value: string) => void;
  errors: NameEditorErrors;
  canSave: boolean;
  saving: boolean;
  save: () => void;
  close: () => void;
  confirmingLeave: boolean;
  stay: () => void;
  leave: () => void;
}

export function NameEditorContent(props: NameEditorContentProps) {
  const { loadState, retryLoad, value, onChange, errors, canSave, saving, save, close } = props;
  if (loadState === "error") return <LoadFailure onRetry={retryLoad} />;

  return (
    <>
      <EditorShell
        title="تعديل الاسم"
        description="يظهر اسمك في لوحتك وفي الدورات التي تشترك فيها."
        tips={TIPS}
        onClose={close}
        footer={
          <>
            <ActionButton onClick={save} disabled={!canSave} aria-busy={saving || undefined}>
              {saving ? <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden /> : null}
              {saving ? "جارٍ الحفظ…" : "حفظ"}
            </ActionButton>
            <ActionButton variant="secondary" onClick={close} disabled={saving}>إلغاء</ActionButton>
          </>
        }
      >
        {loadState === "loading" ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <TextField
              id="settings-full-name"
              label="الاسم الكامل"
              value={value}
              onChange={onChange}
              error={errors.fullName}
              autoComplete="name"
              disabled={saving}
              hint={`${value.trim().length} / ${FULL_NAME_MAX_LENGTH}`}
            />
          </form>
        )}
        {errors.general ? <p role="alert" style={{ fontSize: 13, color: DANGER }}>{errors.general}</p> : null}
      </EditorShell>
      <UnsavedChangesDialog open={props.confirmingLeave} onStay={props.stay} onLeave={props.leave} />
    </>
  );
}
