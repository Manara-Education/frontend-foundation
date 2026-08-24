import { Mail, Lock } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import {
  FormField,
  PrimaryButton,
  LinkButton,
  Divider,
} from "@/features/auth/components/FormField";
import type { LoginErrors } from "../types/login.types";
import * as React from "react";

interface LoginFormProps {
  email: string;
  password: string;
  rememberMe: boolean;
  loading: boolean;
  errors: LoginErrors;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRememberMeToggle: () => void;
  onSubmit: (e: React.ChangeEvent<HTMLFormElement>) => void;
  onForgotPassword: () => void;
  onRegister: () => void;
}

export function LoginForm({
  email,
  password,
  rememberMe,
  loading,
  errors,
  onEmailChange,
  onPasswordChange,
  onRememberMeToggle,
  onSubmit,
  onForgotPassword,
  onRegister,
}: LoginFormProps) {
  return (
    <AuthCard
      title="تسجيل الدخول إلى منارة"
      subtitle="أهلاً بعودتك — استمر في رحلتك التعليمية"
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {/* General error */}
        {errors.general && (
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{
              background: "rgba(212,24,61,0.06)",
              border: "1px solid rgba(212,24,61,0.2)",
              fontFamily: "'Cairo', sans-serif",
              fontSize: 14,
              color: "#D4183D",
            }}
          >
            <span>⚠️</span>
            <span>{errors.general}</span>
          </div>
        )}

        <FormField
          label="البريد الإلكتروني"
          type="email"
          placeholder="example@manara.com"
          value={email}
          onChange={onEmailChange}
          error={errors.email}
          icon={<Mail size={17} />}
          dir="ltr"
          style={{ textAlign: "right" }}
        />

        <div className="flex flex-col gap-2">
          <FormField
            label="كلمة المرور"
            isPassword
            placeholder="••••••••"
            value={password}
            onChange={onPasswordChange}
            error={errors.password}
            icon={<Lock size={17} />}
          />
          <div className="flex justify-end">
            <LinkButton onClick={onForgotPassword}>
              نسيت كلمة المرور؟
            </LinkButton>
          </div>
        </div>

        {/* Remember me */}
        <label
          className="flex items-center gap-3 cursor-pointer select-none"
          style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#2C3156" }}
        >
          <div
            onClick={onRememberMeToggle}
            className="flex-shrink-0 w-5 h-5 rounded-md transition-all duration-150 flex items-center justify-center cursor-pointer"
            style={{
              background: rememberMe ? "#4E5B92" : "transparent",
              border: `2px solid ${rememberMe ? "#4E5B92" : "rgba(78,91,146,0.3)"}`,
            }}
          >
            {rememberMe && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span>تذكّرني</span>
        </label>

        <div className="mt-1">
          <PrimaryButton type="submit" loading={loading}>
            تسجيل الدخول
          </PrimaryButton>
        </div>

        <Divider />

        <div
          className="text-center"
          style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#717182" }}
        >
          ليس لديك حساب؟{" "}
          <LinkButton onClick={onRegister}>إنشاء حساب جديد</LinkButton>
        </div>
      </form>
    </AuthCard>
  );
}
