import { useState } from "react";
import { useNavigate } from "react-router";
import { registerUser } from "../services/register.service";
import type { RegisterErrors, RegisterFormState, PasswordStrength } from "../types/register.types";
import { ApiError } from "@/shared/api";
import * as React from "react";

export function useRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Omit<RegisterFormState, 'agreed'>>({ name: "", email: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});

  const setField = (k: keyof Omit<RegisterFormState, 'agreed'>) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = (): RegisterErrors => {
    const errs: RegisterErrors = {};
    if (!form.name.trim()) errs.name = "الاسم الكامل مطلوب";
    if (!form.email) errs.email = "البريد الإلكتروني مطلوب";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "البريد الإلكتروني غير صحيح";
    if (!form.password) errs.password = "كلمة المرور مطلوبة";
    else if (form.password.length < 8) errs.password = "يجب أن تكون كلمة المرور 8 أحرف على الأقل";
    if (!form.confirm) errs.confirm = "تأكيد كلمة المرور مطلوب";
    else if (form.password !== form.confirm) errs.confirm = "كلمتا المرور غير متطابقتين";
    if (!agreed) errs.agreed = "يجب الموافقة على الشروط والأحكام";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setErrors({});
    setLoading(true);

    try {
      await registerUser({ fullName: form.name, email: form.email, password: form.password });
      navigate("/otp", { state: { email: form.email, context: "email-verification" } });
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
    agreed,
    setAgreed,
    loading,
    errors,
    setField,
    handleSubmit,
  };
}
