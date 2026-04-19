import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, User } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { FormField, PrimaryButton, LinkButton, Divider } from "@/features/auth/components/FormField";

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "الاسم الكامل مطلوب";
    if (!form.email) errs.email = "البريد الإلكتروني مطلوب";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "البريد الإلكتروني غير صحيح";
    if (!form.password) errs.password = "كلمة المرور مطلوبة";
    else if (form.password.length < 8) errs.password = "يجب أن تكون كلمة المرور 8 أحرف على الأقل";
    if (!form.confirm) errs.confirm = "تأكيد كلمة المرور مطلوب";
    else if (form.password !== form.confirm) errs.confirm = "كلمتا المرور غير متطابقتين";
    if (!agreed) errs.agreed = "يجب الموافقة على الشروط والأحكام";
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
      navigate("/otp");
    }, 1500);
  };

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
    <AuthLayout>
      <AuthCard
        title="ابدأ رحلتك مع منارة"
        subtitle="أنشئ حسابك مجاناً وابدأ التعلم فوراً"
        maxWidth={460}
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <FormField
            label="الاسم الكامل"
            type="text"
            placeholder="أدخل اسمك الكامل"
            value={form.name}
            onChange={set("name")}
            error={errors.name}
            icon={<User size={17} />}
          />

          <FormField
            label="البريد الإلكتروني"
            type="email"
            placeholder="example@manara.com"
            value={form.email}
            onChange={set("email")}
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
              onChange={set("password")}
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
            onChange={set("confirm")}
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
                onClick={() => setAgreed(!agreed)}
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
            <LinkButton onClick={() => navigate("/")}>تسجيل الدخول</LinkButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
