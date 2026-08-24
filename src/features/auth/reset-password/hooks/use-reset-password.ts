import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { changePassword, resetPassword } from "../services/reset-password.service";
import type { ResetPasswordErrors, ResetPasswordFormState } from "../types/reset-password.types";
import { ApiError } from "@/shared/api";
import { postAuthPath, useAuth } from "@/shared/auth";
import { paths } from "@/shared/navigation";
import * as React from "react";

export interface EvaluatedRule {
  id: string;
  label: string;
  passed: boolean;
}

export function useResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const state = location.state as { email?: string; code?: string; from?: string } | null;
  const email = state?.email;
  const code = state?.code;
  const fromProfile = state?.from === "profile";

  /**
   * The forced flow: the server has flagged this account as owing a password change, and the
   * route guard sent it here. Same screen, but identity is already proven by the session, so
   * the new password is set through `change-password` and the current one stands in for the
   * emailed code. Read from the auth state, never from navigation state — a value the client
   * could put in `location.state` would be a value the client could invent.
   */
  const forced = user?.requiresPasswordReset === true;

  /*
    Three ways in: a forced reset the guard sent here, a verified one-time code, or a
    signed-in user coming from their profile. None of them means the screen was opened
    directly, with nothing to reset.
  */
  useEffect(() => {
    if (!forced && !fromProfile && (!email || !code)) {
      navigate(paths.login, { replace: true });
    }
  }, [email, code, forced, fromProfile, navigate]);


  const [form, setForm] = useState<ResetPasswordFormState>({
    currentPassword: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const setField = (k: keyof ResetPasswordFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const passwordRules = [
    { id: "length", label: "٨ أحرف على الأقل", test: (p: string) => p.length >= 8 },
    { id: "upper", label: "حرف كبير واحد على الأقل (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
    { id: "number", label: "رقم واحد على الأقل (0-9)", test: (p: string) => /[0-9]/.test(p) },
    { id: "special", label: "رمز خاص واحد على الأقل (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  const evaluatedRules: EvaluatedRule[] = passwordRules.map((r) => ({
    id: r.id,
    label: r.label,
    passed: r.test(form.password),
  }));

  const validate = (): ResetPasswordErrors => {
    const errs: ResetPasswordErrors = {};
    if (forced && !form.currentPassword) errs.currentPassword = "كلمة المرور الحالية مطلوبة";
    if (!form.password) errs.password = "كلمة المرور مطلوبة";
    else if (form.password.length < 8) errs.password = "كلمة المرور قصيرة جداً";
    else if (forced && form.password === form.currentPassword)
      errs.password = "يجب أن تختلف كلمة المرور الجديدة عن الحالية";
    if (!form.confirm) errs.confirm = "تأكيد كلمة المرور مطلوب";
    else if (form.password !== form.confirm) errs.confirm = "كلمتا المرور غير متطابقتين";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setErrors({});
    setLoading(true);

    try {
      if (forced) {
        await changePassword({
          currentPassword: form.currentPassword,
          newPassword: form.password,
        });

        // Ask the server what the user looks like now rather than assuming the flag cleared.
        // Nothing here writes `requiresPasswordReset`; if it somehow came back still set, the
        // guard would send us straight back to this screen, which is the correct outcome.
        const fresh = await refreshUser();
        navigate(postAuthPath(fresh), { replace: true });
        return;
      }

      await resetPassword({ email: email!, code: code!, newPassword: form.password });
      setDone(true);
    } catch (err) {
      // Stay here with the requirement intact. A failed attempt changed nothing on the server.
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
    errors,
    loading,
    done,
    forced,
    fromProfile,
    setField,
    handleSubmit,
    evaluatedRules,
  };
}
