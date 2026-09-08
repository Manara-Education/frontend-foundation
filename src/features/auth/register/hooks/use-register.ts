import { useState } from "react";
import { useNavigate } from "react-router";
import { useCurrentTerms } from "@/features/legal/terms";
import { paths } from "@/shared/navigation";
import { registerUser } from "../services/register.service";
import type { RegisterErrors, RegisterFormState, PasswordStrength } from "../types/register.types";
import { ApiError, ApiErrorCode } from "@/shared/api";
import {
  TERMS_CONSENT_REQUIRED_ERROR,
  TERMS_UNAVAILABLE_MESSAGE,
} from "../content/terms-consent.content";
import * as React from "react";

export function useRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterFormState>({
    name: "",
    email: "",
    password: "",
    confirm: "",
    // Unchecked. A pre-ticked consent box is not a consent.
    termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  /** Set when the server refuses the version we consented to. Cleared on the next attempt. */
  const [termsOutdated, setTermsOutdated] = useState(false);

  /*
    Which version of the terms is in force. The server owns this answer; there is no
    fallback and no cached default, so if it cannot be fetched the form refuses to submit
    rather than inventing a version to record a consent against.
  */
  const terms = useCurrentTerms();

  const setField = (k: keyof RegisterFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const setTermsAccepted = (accepted: boolean) => {
    setForm((f) => ({ ...f, termsAccepted: accepted }));
    // Ticking the box answers the complaint, so the complaint goes away with it.
    if (accepted) setErrors((prev) => ({ ...prev, terms: undefined }));
  };

  const validate = (): RegisterErrors => {
    const errs: RegisterErrors = {};
    if (!form.name.trim()) errs.name = "الاسم الكامل مطلوب";
    if (!form.email) errs.email = "البريد الإلكتروني مطلوب";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "البريد الإلكتروني غير صحيح";
    if (!form.password) errs.password = "كلمة المرور مطلوبة";
    else if (form.password.length < 8) errs.password = "يجب أن تكون كلمة المرور 8 أحرف على الأقل";
    if (!form.confirm) errs.confirm = "تأكيد كلمة المرور مطلوب";
    else if (form.password !== form.confirm) errs.confirm = "كلمتا المرور غير متطابقتين";
    // Re-checked here rather than trusted from the disabled button: the button is a
    // convenience, and a form can still be submitted around it.
    if (!form.termsAccepted) errs.terms = TERMS_CONSENT_REQUIRED_ERROR;
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // Consent has two halves — the acceptance and the version it was given for. Without
    // the second, there is nothing meaningful to record, so the request is not sent.
    const version = terms.current?.version;
    if (!version) { setErrors({ general: TERMS_UNAVAILABLE_MESSAGE }); return; }

    setErrors({});
    setTermsOutdated(false);
    setLoading(true);

    try {
      await registerUser({
        fullName: form.name,
        email: form.email,
        password: form.password,
        termsAccepted: true,
        termsVersion: version,
      });
      navigate(paths.otp, { state: { email: form.email, context: "email-verification" } });
    } catch (err) {
      if (err instanceof ApiError && err.is(ApiErrorCode.TERMS_VERSION_OUTDATED)) {
        /*
          The terms moved while this form was open. Nothing was created, and the acceptance
          the user gave was to text that is no longer the agreement — so it is withdrawn
          rather than resubmitted against the new version. What they typed stays: making
          someone retype their name and email is a punishment for our timing, not theirs.
        */
        setForm((f) => ({ ...f, termsAccepted: false }));
        setTermsOutdated(true);
        setErrors({});
        terms.refresh();
      } else if (err instanceof ApiError && err.is(ApiErrorCode.TERMS_UNAVAILABLE)) {
        setErrors({ general: TERMS_UNAVAILABLE_MESSAGE });
      } else if (err instanceof ApiError) {
        setErrors({ general: err.errors[0] });
      } else {
        setErrors({ general: "حدث خطأ غير متوقع، حاول مرة أخرى" });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (): PasswordStrength | null => {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "ضعيفة", color: "#D4183D", width: "25%" };
    if (score === 2) return { label: "مقبولة", color: "#F5A623", width: "55%" };
    if (score === 3) return { label: "جيدة", color: "#4E5B92", width: "75%" };
    return { label: "قوية", color: "#27AE60", width: "100%" };
  };

  const strength = getPasswordStrength();

  return {
    form,
    strength,
    loading,
    errors,
    setField,
    setTermsAccepted,
    handleSubmit,
    termsOutdated,
    /** The version could not be established, so the form cannot record a consent. */
    termsLoadFailed: terms.status === "error",
    retryTerms: terms.refresh,
    /** Both halves of the consent are in hand. */
    canSubmit: form.termsAccepted && terms.current !== null,
  };
}
