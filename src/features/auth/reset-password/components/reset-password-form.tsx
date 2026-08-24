import { useNavigate } from "react-router";
import { paths } from "@/shared/navigation";
import { Lock, Check, ChevronRight } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { FormField, PrimaryButton } from "@/features/auth/components/FormField";
import { ManaraLogoIcon } from "@/shared/components/ManaraLogo";
import type { ResetPasswordErrors, ResetPasswordFormState } from "../types/reset-password.types";
import type { EvaluatedRule } from "../hooks/use-reset-password";
import * as React from "react";

const PRIMARY = "#4E5B92";

interface ResetPasswordFormProps {
  form: ResetPasswordFormState;
  errors: ResetPasswordErrors;
  loading: boolean;
  done: boolean;
  fromProfile: boolean;
  evaluatedRules: EvaluatedRule[];
  onChange: (k: keyof ResetPasswordFormState) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ResetPasswordForm({
  form,
  errors,
  loading,
  done,
  fromProfile,
  evaluatedRules,
  onChange,
  onSubmit,
}: ResetPasswordFormProps) {
  const navigate = useNavigate();

  if (done) {
    return (
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div
          className="rounded-3xl p-10 flex flex-col items-center text-center"
          style={{
            background: "#ffffff",
            boxShadow: "0 4px 40px rgba(78,91,146,0.08), 0 1px 8px rgba(0,0,0,0.04)",
            border: "1px solid rgba(78,91,146,0.08)",
          }}
        >
          {/* Success ring */}
          <div className="relative mb-6">
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 84,
                height: 84,
                background: "linear-gradient(135deg, rgba(78,91,146,0.12) 0%, rgba(78,91,146,0.06) 100%)",
                border: "1px solid rgba(78,91,146,0.15)",
              }}
            >
              <Check size={36} color={PRIMARY} strokeWidth={2.5} />
            </div>
            {/* Orbiting logo */}
            <div
              className="absolute -bottom-1 -left-1 rounded-full flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                background: PRIMARY,
                boxShadow: "0 2px 8px rgba(78,91,146,0.4)",
              }}
            >
              <ManaraLogoIcon size={16} color="white" />
            </div>
          </div>

          <h2
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              fontSize: 22,
              color: "#1E2340",
              marginBottom: 10,
            }}
          >
            تم تعيين كلمة المرور بنجاح!
          </h2>
          <p
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 400,
              fontSize: 14,
              color: "#717182",
              lineHeight: 1.8,
              marginBottom: 30,
            }}
          >
            كلمة مرورك الجديدة جاهزة.
            <br />
            يمكنك الآن تسجيل الدخول إلى حسابك في منارة
          </p>

          {/* Decorative divider */}
          <div className="flex items-center gap-3 mb-8 w-full">
            <div style={{ flex: 1, height: 1, background: "rgba(78,91,146,0.1)" }} />
            <ManaraLogoIcon size={14} color="rgba(78,91,146,0.3)" />
            <div style={{ flex: 1, height: 1, background: "rgba(78,91,146,0.1)" }} />
          </div>

          {/*
            Client navigation, not a page load. This used to be a `window.location.replace`
            to the old query-parameter address, which threw away the running application —
            session, caches and all — to move one screen.
          */}
          <PrimaryButton onClick={() => navigate(fromProfile ? paths.profile : paths.login, { replace: true })}>
            {fromProfile ? "العودة إلى الملف الشخصي" : "العودة إلى تسجيل الدخول"}
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <AuthCard
      title="إعادة تعيين كلمة المرور"
      subtitle="اختر كلمة مرور قوية تحمي حسابك على منارة"
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

        {fromProfile && (
          <button
            type="button"
            onClick={() => navigate(paths.profile, { replace: true })}
            className="flex items-center gap-1.5 transition-opacity duration-150 hover:opacity-70"
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: PRIMARY,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <ChevronRight size={15} color={PRIMARY} />
            العودة إلى الملف الشخصي
          </button>
        )}
      
        <FormField
          label="كلمة المرور الجديدة"
          isPassword
          placeholder="أدخل كلمة مرور قوية"
          value={form.password}
          onChange={onChange("password")}
          error={errors.password}
          icon={<Lock size={17} />}
        />

        {/* Password rules */}
        <div
          className="rounded-xl p-4 flex flex-col gap-2"
          style={{ background: "#F6F7FC", border: "1px solid rgba(78,91,146,0.08)" }}
        >
          <p
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: "#2C3156",
              marginBottom: 4,
            }}
          >
            متطلبات كلمة المرور:
          </p>
          {evaluatedRules.map((rule) => {
            const passed = rule.passed;
            return (
              <div key={rule.id} className="flex items-center gap-2">
                <div
                  className="rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    width: 18,
                    height: 18,
                    background: passed ? PRIMARY : "transparent",
                    border: `1.5px solid ${passed ? PRIMARY : "rgba(78,91,146,0.2)"}`,
                  }}
                >
                  {passed && <Check size={10} color="white" strokeWidth={3} />}
                </div>
                <span
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: 12,
                    color: passed ? PRIMARY : "#9BA3C4",
                    fontWeight: passed ? 500 : 400,
                    transition: "color 0.2s",
                  }}
                >
                  {rule.label}
                </span>
              </div>
            );
          })}
        </div>

        <FormField
          label="تأكيد كلمة المرور الجديدة"
          isPassword
          placeholder="أعد إدخال كلمة المرور"
          value={form.confirm}
          onChange={onChange("confirm")}
          error={errors.confirm}
          icon={<Lock size={17} />}
        />

        {/* Match indicator */}
        {form.confirm && form.password && (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2.5"
            style={{
              background:
                form.password === form.confirm
                  ? "rgba(39,174,96,0.07)"
                  : "rgba(212,24,61,0.06)",
              border: `1px solid ${
                form.password === form.confirm
                  ? "rgba(39,174,96,0.2)"
                  : "rgba(212,24,61,0.2)"
              }`,
            }}
          >
            <span
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontSize: 13,
                color: form.password === form.confirm ? "#27AE60" : "#D4183D",
              }}
            >
              {form.password === form.confirm
                ? "✓ كلمتا المرور متطابقتان"
                : "✗ كلمتا المرور غير متطابقتين"}
            </span>
          </div>
        )}

        <div className="mt-1">
          <PrimaryButton type="submit" loading={loading}>
            حفظ كلمة المرور الجديدة
          </PrimaryButton>
        </div>
      </form>
    </AuthCard>
  );
}
