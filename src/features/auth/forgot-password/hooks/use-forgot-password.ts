import { useState } from "react";
import { useNavigate } from "react-router";
import { paths } from "@/shared/navigation";
import { forgotPassword } from "../services/forgot-password.service";
import type { ForgotPasswordErrors, ForgotPasswordFormState } from "../types/forgot-password.types";
import { ApiError } from "@/shared/api";
import * as React from "react";

export function useForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ForgotPasswordFormState>({ email: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});

  const setField = (k: keyof ForgotPasswordFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = (): ForgotPasswordErrors => {
    const errs: ForgotPasswordErrors = {};
    if (!form.email) errs.email = "البريد الإلكتروني مطلوب";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "البريد الإلكتروني غير صحيح";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setErrors({});
    setLoading(true);

    try {
      await forgotPassword({ email: form.email });
      navigate(paths.otp, { state: { email: form.email, context: "password-reset" } });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ general: err.errors[0] });
      } else {
        setErrors({ general: "حدث خطأ غير متوقع، حاول مرة أخرى" });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    errors,
    setField,
    handleSubmit,
  };
}
