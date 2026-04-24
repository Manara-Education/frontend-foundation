import { useNavigate } from "react-router";
import { ArrowRight, RefreshCw } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { PrimaryButton } from "@/features/auth/components/FormField";
import { OTP_LENGTH } from "../hooks/use-otp";
import type { OtpContextType } from "../types/otp.types";
import * as React from "react";

const PRIMARY = "#4E5B92";

interface OtpFormProps {
  otp: string[];
  error: string;
  success: boolean;
  loading: boolean;
  countdown: number;
  canResend: boolean;
  inputsRef: React.RefObject<(HTMLInputElement | null)[]>;
  context: OtpContextType;
  onChange: (idx: number, val: string) => void;
  onKeyDown: (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onVerify: (e: React.FormEvent<HTMLFormElement>) => void;
  onResend: () => void;
  formatCountdown: (s: number) => string;
}

export function OtpForm({
  otp,
  error,
  success,
  loading,
  countdown,
  canResend,
  inputsRef,
  context,
  onChange,
  onKeyDown,
  onPaste,
  onVerify,
  onResend,
  formatCountdown,
}: OtpFormProps) {
  const navigate = useNavigate();

  return (
    <AuthCard
      title="التحقق من الرمز"
      subtitle={`أدخل الرمز المكوّن من ${OTP_LENGTH} أرقام الذي أرسلناه إلى بريدك الإلكتروني`}
    >
      <form onSubmit={onVerify} noValidate className="flex flex-col gap-6">
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
                onChange={(e) => onChange(idx, e.target.value)}
                onKeyDown={(e) => onKeyDown(idx, e)}
                onPaste={onPaste}
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

        <PrimaryButton type="submit" loading={loading && !success}>
          تأكيد الرمز
        </PrimaryButton>

        {/* Resend */}
        <div className="flex flex-col items-center gap-1">
          {canResend ? (
            <button
              type="button"
              onClick={onResend}
              disabled={loading}
              className="flex items-center gap-2 transition-colors duration-150"
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: loading ? "#9BA3C4" : PRIMARY,
                background: "none",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
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
            onClick={() => navigate(context === "password-reset" ? "/forgot-password" : "/")}
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
  );
}
