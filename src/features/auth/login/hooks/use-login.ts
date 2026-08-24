import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { login } from "../services/auth.service";
import { ApiError } from "@/shared/api";
import { postAuthPath, useAuth, type FromLocationState } from "@/shared/auth";
import { paths } from "@/shared/navigation";
import type { LoginErrors } from "../types/login.types";
import * as React from "react";

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  /*
    The protected URL a guard turned away, if this screen was reached that way. Signing in
    then resumes that journey instead of dropping everyone on the same dashboard.
  */
  const from = (location.state as FromLocationState | null)?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const validate = (): LoginErrors => {
    const newErrors: LoginErrors = {};
    if (!email) newErrors.email = "البريد الإلكتروني مطلوب";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "البريد الإلكتروني غير صحيح";
    if (!password) newErrors.password = "كلمة المرور مطلوبة";
    else if (password.length < 6)
      newErrors.password = "كلمة المرور قصيرة جداً";
    return newErrors;
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const user = await login({ email, password });
      setUser(user);
      // Replace: the login screen is a step on the way somewhere, not somewhere to go back to.
      // The destination honours `from`, unless the account owes a password change — that
      // outranks wherever it was originally headed.
      navigate(postAuthPath(user, from), { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors[0] === "يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول") {
          // The intended destination rides along, so it survives the verification detour.
          navigate(paths.otp, { state: { email, context: "email-verification", from } });
          return;
        }
        setErrors({ general: err.errors[0] });
      } else {
        setErrors({ general: "حدث خطأ غير متوقع، حاول مرة أخرى" });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    loading,
    errors,
    handleSubmit,
  };
}
