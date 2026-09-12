import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { changePassword, resetPassword } from "../services/reset-password.service";
import type { ResetPasswordErrors, ResetPasswordFormState } from "../types/reset-password.types";
import { ApiError } from "@/shared/api";
import { postAuthPath, useAuth } from "@/shared/auth";
import { paths } from "@/shared/navigation";
import { passwordPolicyError, passwordRefusal } from "@/features/auth/password-policy/password-policy";
import * as React from "react";

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

  const validate = (): ResetPasswordErrors => {
    const errs: ResetPasswordErrors = {};
    if (forced && !form.currentPassword) errs.currentPassword = "كلمة المرور الحالية مطلوبة";
    if (!form.password) errs.password = "كلمة المرور مطلوبة";
    else if (passwordPolicyError(form.password)) errs.password = passwordPolicyError(form.password);
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
        // A refused password belongs under its field, beside the checklist. Anything else goes
        // above the form, without the API's field name in front of it.
        const refusal = passwordRefusal(err, "newPassword");
        setErrors(refusal ? { password: refusal } : { general: err.errors[0]?.replace(/^[A-Za-z]+: /, "") });
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
  };
}
