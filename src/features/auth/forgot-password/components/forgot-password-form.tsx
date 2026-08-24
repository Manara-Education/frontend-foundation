import { useNavigate } from "react-router";
import { paths } from "@/shared/navigation";
import { Mail, ArrowRight } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { FormField, PrimaryButton } from "@/features/auth/components/FormField";
import { ManaraLogoIcon } from "@/shared/components/ManaraLogo";
import type { ForgotPasswordErrors, ForgotPasswordFormState } from "../types/forgot-password.types";

interface ForgotPasswordFormProps {
  form: ForgotPasswordFormState;
  loading: boolean;
  errors: ForgotPasswordErrors;
  onChange: (k: keyof ForgotPasswordFormState) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ForgotPasswordForm({
  form,
  loading,
  errors,
  onChange,
  onSubmit,
}: ForgotPasswordFormProps) {
  const navigate = useNavigate();

  return (
    <AuthCard
      title="نسيت كلمة المرور؟"
      subtitle="لا تقلق — سنرسل لك رمز التحقق على بريدك الإلكتروني لإعادة تعيين كلمة المرور"
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {/* General error */}
        {errors.general && (
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{
              background: "rgba(212,24,61,0.06)",
              border: "1px solid rgba(212,24,61,0.2)",
            }}
          >
            <p
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontSize: 14,
                color: "#D4183D",
              }}
            >
              {errors.general}
            </p>
          </div>
        )}

        {/* Info box */}
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: "rgba(78,91,146,0.06)",
            border: "1px solid rgba(78,91,146,0.12)",
          }}
        >
          <ManaraLogoIcon size={20} color="#4E5B92" className="flex-shrink-0 mt-0.5" />
          <p
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 400,
              fontSize: 13,
              color: "#4E5B92",
              lineHeight: 1.7,
            }}
          >
            أدخل بريدك الإلكتروني المسجّل في منارة وسنرسل لك رمز التحقق المكوّن من ٦ أرقام
          </p>
        </div>

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

        <div className="mt-1">
          <PrimaryButton type="submit" loading={loading}>
            إرسال رمز التحقق
          </PrimaryButton>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => navigate(paths.login)}
            className="flex items-center gap-2 transition-colors duration-150"
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              color: "#717182",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <ArrowRight size={15} />
            العودة إلى تسجيل الدخول
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
