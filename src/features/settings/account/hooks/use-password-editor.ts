import { useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "@/shared/api";
import { useAuth } from "@/shared/auth";
import {
  PASSWORD_REQUIREMENTS,
  evaluatePassword,
  passwordPolicyError,
  passwordRefusal,
} from "@/features/auth/password-policy/password-policy";
import { paths } from "@/shared/navigation/paths";
import { useUnsavedChangesGuard } from "../../hooks/use-unsaved-changes-guard";
import { strengthLabel } from "../formatters/account.formatter";
import { changePassword } from "../services/account.service";
import type { PasswordEditorErrors, PasswordFieldId, SaveState } from "../types/account.types";

const CHANGE_FAILED = "تعذّر تغيير كلمة المرور. تحقّق من اتصالك ثم حاول مرة أخرى.";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

export function usePasswordEditor() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [values, setValues] = useState<Record<PasswordFieldId, string>>(EMPTY);
  const [visible, setVisible] = useState<Record<PasswordFieldId, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<PasswordEditorErrors>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const dirty = Object.values(values).some(Boolean);
  const guard = useUnsavedChangesGuard(dirty && saveState !== "saving");

  const policy = evaluatePassword(values.newPassword);
  const met = PASSWORD_REQUIREMENTS.filter((requirement) => policy[requirement.id]).length;

  const onChange = (field: PasswordFieldId, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, general: undefined }));
    if (saveState === "error") setSaveState("idle");
  };

  const toggleVisible = (field: PasswordFieldId) =>
    setVisible((current) => ({ ...current, [field]: !current[field] }));

  const validate = (): PasswordEditorErrors => {
    const found: PasswordEditorErrors = {};
    if (!values.currentPassword) found.currentPassword = "أدخل كلمة المرور الحالية.";
    const policyError = passwordPolicyError(values.newPassword);
    if (!values.newPassword) found.newPassword = "أدخل كلمة المرور الجديدة.";
    else if (policyError) found.newPassword = policyError;
    if (!values.confirmPassword) found.confirmPassword = "أعد إدخال كلمة المرور الجديدة.";
    else if (values.confirmPassword !== values.newPassword) found.confirmPassword = "كلمتا المرور غير متطابقتين.";
    return found;
  };

  const submit = async () => {
    if (saveState === "saving") return;
    const found = validate();
    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      return;
    }
    setSaveState("saving");
    setErrors({});
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      // Nothing sensitive outlives the request.
      setValues(EMPTY);
      await refreshUser().catch(() => null);
      guard.release();
      navigate(paths.settings.account, { state: { notice: "password-changed" } });
    } catch (err) {
      setSaveState("error");
      // A 401 is an expired session: the shared client signs the app out and the route guard
      // takes over, so only answers about the request itself are handled here.
      if (err instanceof ApiError && err.statusCode === 400) {
        const refusal = passwordRefusal(err, "newPassword");
        setErrors(refusal ? { newPassword: refusal } : { general: err.errors[0] ?? CHANGE_FAILED });
      } else if (!(err instanceof ApiError && err.statusCode === 401)) {
        setErrors({ general: CHANGE_FAILED });
      }
    }
  };

  return {
    values,
    visible,
    errors,
    onChange,
    toggleVisible,
    strength: { met, total: PASSWORD_REQUIREMENTS.length, label: strengthLabel(met, PASSWORD_REQUIREMENTS.length) },
    saving: saveState === "saving",
    submit,
    close: () => navigate(paths.settings.account),
    confirmingLeave: guard.confirmingLeave,
    stay: guard.stay,
    leave: guard.leave,
  };
}
