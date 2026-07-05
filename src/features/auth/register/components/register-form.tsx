import { Mail, Lock, User } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { FormField, PrimaryButton, LinkButton, Divider } from "@/features/auth/components/FormField";
import type { RegisterErrors, RegisterFormState, PasswordStrength } from "../types/register.types";
import * as React from "react";

interface RegisterFormProps {
  form: RegisterFormState;
  strength: PasswordStrength | null;
  loading: boolean;
  errors: RegisterErrors;
  onChange: (k: keyof RegisterFormState) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onLoginClick: () => void;
}

export function RegisterForm({
  form,
  strength,
  loading,
  errors,
  onChange,
  onSubmit,
  onLoginClick,
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
            placeholder="٨ أحرف على الأقل"
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
                قوة كلمة المرور: {strength.label}
              </span>
            </div>
          )}
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


        <div className="mt-1">
          <PrimaryButton type="submit" loading={loading}>
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
