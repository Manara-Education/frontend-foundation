import { Mail, Lock, User } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { FormField, PrimaryButton, LinkButton, Divider } from "@/features/auth/components/FormField";
import type { RegisterErrors, RegisterFormState, PasswordStrength } from "../types/register.types";
import { TermsConsentField } from "./terms-consent-field";
import { PASSWORD_GUIDANCE } from "@/features/auth/password-policy/password-policy";
import * as React from "react";

interface RegisterFormProps {
  form: RegisterFormState;
  strength: PasswordStrength | null;
  loading: boolean;
  errors: RegisterErrors;
  onChange: (k: keyof RegisterFormState) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTermsAcceptedChange: (accepted: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onLoginClick: () => void;
  /** The server refused the last attempt: the terms changed while this form was open. */
  termsOutdated: boolean;
  /** The current terms version could not be fetched, so no consent can be recorded. */
  termsLoadFailed: boolean;
  onRetryTerms: () => void;
  /** Whether the form has everything it needs — consent given, and a version to give it for. */
  canSubmit: boolean;
}

export function RegisterForm({
  form,
  strength,
  loading,
  errors,
  onChange,
  onTermsAcceptedChange,
  onSubmit,
  onLoginClick,
  termsOutdated,
  termsLoadFailed,
  onRetryTerms,
  canSubmit,
}: RegisterFormProps) {
  return (
    <AuthCard
      title="ابدأ رحلتك مع منارة"
      subtitle="أنشئ حسابك مجاناً وابدأ التعلم فوراً"
      maxWidth={460}
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
          label="الاسم الكامل"
          type="text"
          placeholder="أدخل اسمك الكامل"
          value={form.name}
          onChange={onChange("name")}
          error={errors.name}
          icon={<User size={17} />}
        />

        <FormField
          label="البريد الإلكتروني"
          type="email"
          placeholder="example@manara.com"
          value={form.email}
          onChange={onChange("email")}
          error={errors.email}
          icon={<Mail size={17} />}
          dir="ltr"
          style={{ textAlign: "right" }}
        />

        <div className="flex flex-col gap-2">
          <FormField
            label="كلمة المرور"
            isPassword
            placeholder="15 حرفاً على الأقل"
            value={form.password}
            onChange={onChange("password")}
            error={errors.password}
            icon={<Lock size={17} />}
          />
          {/* Password strength */}
          {strength && (
            <div className="flex flex-col gap-1.5">
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: 4, background: "rgba(78,91,146,0.1)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: strength.width, background: strength.color }}
                />
              </div>
              <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: strength.color }}>
                طول كلمة المرور: {strength.label}
              </span>
            </div>
          )}
          <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#717182", lineHeight: 1.7 }}>
            {PASSWORD_GUIDANCE}
          </span>
        </div>

        <FormField
          label="تأكيد كلمة المرور"
          isPassword
          placeholder="أعد إدخال كلمة المرور"
          value={form.confirm}
          onChange={onChange("confirm")}
          error={errors.confirm}
          icon={<Lock size={17} />}
        />

        <TermsConsentField
          accepted={form.termsAccepted}
          onAcceptedChange={onTermsAcceptedChange}
          error={errors.terms}
          outdated={termsOutdated}
          loadFailed={termsLoadFailed}
          onRetryTerms={onRetryTerms}
        />

        <div className="mt-1">
          {/*
            Disabled until the box is ticked *and* we know which version is being agreed to.
            This is the affordance, not the enforcement — the submit handler re-checks both,
            because a disabled button is trivial to route around.
          */}
          <PrimaryButton type="submit" loading={loading} disabled={!canSubmit}>
            إنشاء الحساب
          </PrimaryButton>
        </div>

        <Divider />

        <div
          className="text-center"
          style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#717182" }}
        >
          لديك حساب بالفعل؟{" "}
          <LinkButton onClick={onLoginClick}>تسجيل الدخول</LinkButton>
        </div>
      </form>
    </AuthCard>
  );
}
