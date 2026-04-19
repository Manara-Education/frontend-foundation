import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { FormField, PrimaryButton, LinkButton } from "@/features/auth/components/FormField";
import { ManaraLogoIcon } from "@/shared/components/ManaraLogo";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email) return "البريد الإلكتروني مطلوب";
    if (!/\S+@\S+\.\S+/.test(email)) return "البريد الإلكتروني غير صحيح";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  if (sent) {
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
            {/* Success illustration */}
            <div
              className="rounded-full flex items-center justify-center mb-6"
              style={{
                width: 80,
                height: 80,
                background: "linear-gradient(135deg, rgba(78,91,146,0.12) 0%, rgba(78,91,146,0.06) 100%)",
                border: "1px solid rgba(78,91,146,0.15)",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path
                  d="M4 8C4 6.9 4.9 6 6 6H30C31.1 6 32 6.9 32 8V28C32 29.1 31.1 30 30 30H6C4.9 30 4 29.1 4 28V8Z"
                  stroke="#4E5B92"
                  strokeWidth="2"
                  fill="none"
                />
                <path d="M4 8L18 20L32 8" stroke="#4E5B92" strokeWidth="2" strokeLinecap="round" />
                <circle cx="27" cy="27" r="7" fill="#4E5B92" />
                <path d="M23.5 27L26 29.5L30.5 24.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
              تم إرسال رمز التحقق
            </h2>
            <p
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 400,
                fontSize: 14,
                color: "#717182",
                lineHeight: 1.8,
                marginBottom: 28,
              }}
            >
              أرسلنا رمز التحقق إلى بريدك الإلكتروني
              <br />
              <span style={{ color: "#4E5B92", fontWeight: 600 }}>{email}</span>
              <br />
              يرجى التحقق من صندوق الوارد
            </p>

            <PrimaryButton onClick={() => navigate("/otp")}>
              التحقق من الرمز الآن
            </PrimaryButton>

            <div className="mt-5">
              <LinkButton onClick={() => navigate("/")}>
                العودة إلى تسجيل الدخول
              </LinkButton>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="نسيت كلمة المرور؟"
        subtitle="لا تقلق — سنرسل لك رمز التحقق على بريدك الإلكتروني لإعادة تعيين كلمة المرور"
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
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
              onClick={() => navigate("/")}
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
    </AuthLayout>
  );
}
