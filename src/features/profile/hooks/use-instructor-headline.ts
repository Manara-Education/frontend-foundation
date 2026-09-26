import { useEffect, useState } from "react";
import { ApiError } from "@/shared/api";
import { getInstructorProfileRequest, updateInstructorProfileRequest } from "../api/profile.api";

export const HEADLINE_MAX_LENGTH = 120;

/** The instructor's one-line public introduction, shown under their name on course pages. */
export function useInstructorHeadline() {
  const [saved, setSaved] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getInstructorProfileRequest()
      .then(({ data: body }) => {
        const headline = body.data?.headline ?? "";
        setSaved(headline);
        setValue(headline);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const trimmed = value.trim();
  const tooLong = trimmed.length > HEADLINE_MAX_LENGTH;
  const changed = saved !== null && trimmed !== saved.trim();

  const save = async () => {
    if (!changed || tooLong || status === "saving") return;
    setStatus("saving");
    setMessage(null);
    try {
      const { data: body } = await updateInstructorProfileRequest(trimmed);
      const headline = body.data?.headline ?? "";
      setSaved(headline);
      setValue(headline);
      setMessage({ kind: "success", text: "تم حفظ السطر التعريفي." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof ApiError && err.errors[0] ? err.errors[0] : "تعذّر الحفظ. حاول مرة أخرى." });
    } finally {
      setStatus("ready");
    }
  };

  return { value, setValue: (next: string) => { setValue(next); setMessage(null); }, status, message, tooLong, canSave: changed && !tooLong && status === "ready", save };
}
