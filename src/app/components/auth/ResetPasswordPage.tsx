import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, Check } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { FormField, PrimaryButton } from "@/features/auth/components/FormField";
import { ManaraLogoIcon } from "@/shared/components/ManaraLogo";

const PRIMARY = "#4E5B92";

const rules = [
  { id: "length", label: "٨ أحرف على الأقل", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "حرف كبير واحد على الأقل (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number", label: "رقم واحد على الأقل (0-9)", test: (p: string) => /[0-9]/.test(p) },
  {
    id: "special",
    label: "رمز خاص واحد على الأقل (!@#$...)",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.password) errs.password = "كلمة المرور مطلوبة";
    else if (form.password.length < 8) errs.password = "كلمة المرور قصيرة جداً";
    if (!form.confirm) errs.confirm = "تأكيد كلمة المرور مطلوب";
    else if (form.password !== form.confirm) errs.confirm = "كلمتا المرور غير متطابقتين";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1500);
  };

  if (done) {
    return (
      <AuthLayout>
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

            <PrimaryButton onClick={() => navigate("/")}>
              العودة إلى تسجيل الدخول
            </PrimaryButton>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="إعادة تعيين كلمة المرور"
        subtitle="اختر كلمة مرور قوية تحمي حسابك على منارة"
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <FormField
            label="كلمة المرور الجديدة"
            isPassword
            placeholder="أدخل كلمة مرور قوية"
            value={form.password}
            onChange={set("password")}
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
            {rules.map((rule) => {
              const passed = rule.test(form.password);
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
            onChange={set("confirm")}
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
    </AuthLayout>
  );
}
