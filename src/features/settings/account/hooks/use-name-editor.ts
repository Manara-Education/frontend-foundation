import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "@/shared/api";
import { useAuth } from "@/shared/auth";
import { paths } from "@/shared/navigation/paths";
import { useUnsavedChangesGuard } from "../../hooks/use-unsaved-changes-guard";
import { nameError } from "../formatters/account.formatter";
import { getAccountOverview, renameAccount } from "../services/account.service";
import type { LoadState, NameEditorErrors, SaveState } from "../types/account.types";

const SAVE_FAILED = "تعذّر حفظ الاسم. تحقّق من اتصالك ثم حاول مرة أخرى.";

export function useNameEditor() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [savedName, setSavedName] = useState("");
  const [value, setValue] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errors, setErrors] = useState<NameEditorErrors>({});
  const [touched, setTouched] = useState(false);

  const load = useCallback(() => {
    setLoadState("loading");
    getAccountOverview()
      .then((account) => {
        setSavedName(account.fullName);
        setValue(account.fullName);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, []);

  useEffect(load, [load]);

  const changed = loadState === "ready" && value.trim() !== savedName.trim();
  const validationError = nameError(value);
  const guard = useUnsavedChangesGuard(changed && saveState !== "saving");

  const onChange = (next: string) => {
    setValue(next);
    setTouched(true);
    setErrors({});
    if (saveState === "error") setSaveState("idle");
  };

  const close = () => navigate(paths.settings.account);

  const save = async () => {
    if (!changed || saveState === "saving") return;
    if (validationError) {
      setTouched(true);
      setErrors({ fullName: validationError });
      return;
    }
    setSaveState("saving");
    setErrors({});
    try {
      await renameAccount(value);
      // The header and sidebar read the session user; ask the server for it rather than
      // assuming what the rename did.
      await refreshUser().catch(() => null);
      guard.release();
      navigate(paths.settings.account, { state: { notice: "name-saved" } });
    } catch (err) {
      // The typed name stays in the field: a failed save must not cost the person their input.
      setSaveState("error");
      if (err instanceof ApiError && err.statusCode === 400) {
        const field = err.errors.find((message) => message.startsWith("fullName: "));
        setErrors(field ? { fullName: field.slice("fullName: ".length) } : { general: err.errors[0] ?? SAVE_FAILED });
      } else {
        setErrors({ general: SAVE_FAILED });
      }
    }
  };

  return {
    loadState,
    retryLoad: load,
    value,
    onChange,
    errors: touched && validationError && !errors.fullName ? { ...errors, fullName: validationError } : errors,
    canSave: changed && !validationError && saveState !== "saving",
    saving: saveState === "saving",
    save,
    close,
    confirmingLeave: guard.confirmingLeave,
    stay: guard.stay,
    leave: guard.leave,
  };
}
