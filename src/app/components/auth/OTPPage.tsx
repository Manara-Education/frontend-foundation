import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, RefreshCw } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { PrimaryButton, LinkButton } from "@/features/auth/components/FormField";

const OTP_LENGTH = 6;
const PRIMARY = "#4E5B92";

export function OTPPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (idx: number, val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[idx] = cleaned;
    setOtp(newOtp);
    setError("");
    if (cleaned && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[idx] && idx > 0) {
        const newOtp = [...otp];
        newOtp[idx - 1] = "";
        setOtp(newOtp);
        inputsRef.current[idx - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    } else if (e.key === "ArrowRight" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    pasted.split("").forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("يرجى إدخال الرمز المكوّن من ٦ أرقام كاملاً");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (code === "123456") {
        setSuccess(true);
        setTimeout(() => navigate("/reset-password"), 1200);
      } else {
        setError("الرمز المدخل غير صحيح. يرجى المحاولة مجدداً");
        setOtp(Array(OTP_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
      }
    }, 1500);
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    setCountdown(60);
    setCanResend(false);
    inputsRef.current[0]?.focus();
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <AuthLayout>
      <AuthCard
        title="التحقق من الرمز"
        subtitle={`أدخل الرمز المكوّن من ${OTP_LENGTH} أرقام الذي أرسلناه إلى بريدك الإلكتروني`}
      >
        <form onSubmit={handleVerify} noValidate className="flex flex-col gap-6">
          {/* OTP Inputs — reversed for RTL visual order */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-3 justify-center" dir="ltr">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputsRef.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className="transition-all duration-200 outline-none text-center"
                  style={{
                    width: 52,
                    height: 60,
                    borderRadius: 14,
                    border: `2px solid ${
                      error
                        ? "#D4183D"
                        : success
                        ? "#27AE60"
                        : digit
                        ? PRIMARY
                        : "rgba(78,91,146,0.15)"
                    }`,
                    background: digit ? "rgba(78,91,146,0.05)" : "#F6F7FC",
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "#1E2340",
                    boxShadow: digit ? `0 0 0 3px rgba(78,91,146,0.10)` : "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = `2px solid ${PRIMARY}`;
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(78,91,146,0.12)`;
                    e.currentTarget.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    const d = otp[idx];
                    e.currentTarget.style.border = `2px solid ${
                      error ? "#D4183D" : d ? PRIMARY : "rgba(78,91,146,0.15)"
                    }`;
                    e.currentTarget.style.boxShadow = d ? `0 0 0 3px rgba(78,91,146,0.10)` : "none";
                    e.currentTarget.style.background = d ? "rgba(78,91,146,0.05)" : "#F6F7FC";
                  }}
                />
              ))}
            </div>

            {/* Status messages */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-2 w-full"
                style={{ background: "rgba(212,24,61,0.06)", border: "1px solid rgba(212,24,61,0.2)" }}
              >
                <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#D4183D" }}>
                  ⚠️ {error}
                </span>
              </div>
            )}
            {success && (
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-2 w-full"
                style={{ background: "rgba(39,174,96,0.06)", border: "1px solid rgba(39,174,96,0.2)" }}
              >
                <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#27AE60" }}>
                  ✓ تم التحقق بنجاح! جارٍ التحويل...
                </span>
              </div>
            )}
          </div>

          {/* Hint */}
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: "rgba(78,91,146,0.05)", border: "1px solid rgba(78,91,146,0.1)" }}
          >
            <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#717182", textAlign: "center" }}>
              للتجربة، استخدم الرمز:{" "}
              <span style={{ fontWeight: 700, color: PRIMARY, letterSpacing: 3, fontFamily: "monospace" }}>
                123456
              </span>
            </p>
          </div>

          <PrimaryButton type="submit" loading={loading}>
            تأكيد الرمز
          </PrimaryButton>

          {/* Resend */}
          <div className="flex flex-col items-center gap-1">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="flex items-center gap-2 transition-colors duration-150"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  color: PRIMARY,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={14} />
                إعادة إرسال الرمز
              </button>
            ) : (
              <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#9BA3C4" }}>
                إعادة الإرسال بعد{" "}
                <span style={{ color: PRIMARY, fontWeight: 600 }}>{formatCountdown(countdown)}</span>
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
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
              العودة للخلف
            </button>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
