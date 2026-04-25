import { useState } from "react";
import { useNavigate } from "react-router";
import { login } from "../services/auth.service";
import { ApiError } from "@/shared/api";
import type { LoginErrors } from "../types/login.types";
import * as React from "react";

export function useLogin() {
  const navigate = useNavigate();
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
      await login({ email, password });
      navigate("/main");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors[0] === "يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول") {
          navigate("/otp", { state: { email, context: "email-verification" } });
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
