import { Mail, Lock, User } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { FormField, PrimaryButton, LinkButton, Divider } from "@/features/auth/components/FormField";
import type { RegisterErrors, RegisterFormState } from "../types/register.types";
import * as React from "react";

interface RegisterFormProps {
  form: Omit<RegisterFormState, 'agreed'>;
  agreed: boolean;
  loading: boolean;
  errors: RegisterErrors;
  onChange: (k: keyof Omit<RegisterFormState, 'agreed'>) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAgreedToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onLoginClick: () => void;
}

export function RegisterForm({
  form,
  agreed,
  loading,
  errors,
  onChange,
  onAgreedToggle,
  onSubmit,
  onLoginClick,
}: RegisterFormProps) {
  const getPasswordStrength = () => {
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

        {/* Terms */}
        <div className="flex flex-col gap-1">
          <label
            className="flex items-start gap-3 cursor-pointer select-none"
            style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#2C3156", lineHeight: 1.7 }}
          >
            <div
              onClick={onAgreedToggle}
              className="flex-shrink-0 w-5 h-5 rounded-md mt-0.5 transition-all duration-150 flex items-center justify-center cursor-pointer"
              style={{
                background: agreed ? "#4E5B92" : "transparent",
                border: `2px solid ${agreed ? "#4E5B92" : errors.agreed ? "#D4183D" : "rgba(78,91,146,0.3)"}`,
              }}
            >
              {agreed && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span>
              أوافق على{" "}
              <span style={{ color: "#4E5B92", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                الشروط والأحكام
              </span>{" "}
              و
              {" "}<span style={{ color: "#4E5B92", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                سياسة الخصوصية
              </span>
            </span>
          </label>
          {errors.agreed && (
            <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#D4183D", marginRight: 28 }}>
              {errors.agreed}
            </p>
          )}
        </div>

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
