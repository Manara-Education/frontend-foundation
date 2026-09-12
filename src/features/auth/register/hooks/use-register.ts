import { useState } from "react";
import { useNavigate } from "react-router";
import { useCurrentTerms } from "@/features/legal/terms";
import { paths } from "@/shared/navigation";
import { registerUser } from "../services/register.service";
import type { RegisterErrors, RegisterFormState, PasswordStrength } from "../types/register.types";
import { ApiError, ApiErrorCode } from "@/shared/api";
import { passwordLengthError, passwordLengthMeter } from "@/features/auth/password-policy/password-policy";
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
    else if (passwordLengthError(form.password)) errs.password = passwordLengthError(form.password);
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
      // Every accepted registration is answered alike, taken address or not, so the code screen is
      // told where the visitor came from and explains both cases itself.
      navigate(paths.otp, {
        state: { email: form.email, context: "email-verification", origin: "registration" },
      });
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
        // Field errors arrive as "password: <message>"; the field name is the API's, not the reader's.
        setErrors({ general: err.errors[0]?.replace(/^[A-Za-z]+: /, "") });
      } else {
        setErrors({ general: "حدث خطأ غير متوقع، حاول مرة أخرى" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Length is all the client can honestly measure. Composition is not required, so it is not
  // scored, and whether the password is a common one is for the server to say.
  const strength: PasswordStrength | null = passwordLengthMeter(form.password);

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
