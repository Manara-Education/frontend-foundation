import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { verifyOtp, verifyResetOtp, resendOtp } from "../services/otp.service";
import type { OtpErrors, OtpContextType } from "../types/otp.types";
import { ApiError } from "@/shared/api";
import { useAuth } from "@/shared/auth";
import { paths, resolvePostLoginPath } from "@/shared/navigation";
import * as React from "react";

export const OTP_LENGTH = 6;

export function useOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const state = location.state as
    | { email?: string; context?: OtpContextType; from?: string }
    | null;
  const email = state?.email || "";
  const context = state?.context || "email-verification";
  /** Carried through from the login screen when a guard sent the visitor there. */
  const from = state?.from;

  useEffect(() => {
    // Reached without the address the code was sent to, this screen has nothing to verify.
    // Replace: an entry that cannot be returned to should not be left in history.
    if (!email) {
      navigate(paths.login, { replace: true });
    }
  }, [email, navigate]);

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
    const cleaned = val.replace(/\\D/g, "").slice(-1);
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
    const pasted = e.clipboardData.getData("text").replace(/\\D/g, "").slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    pasted.split("").forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("يرجى إدخال الرمز المكوّن من ٦ أرقام كاملاً");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      if (context === "email-verification") {
        const user = await verifyOtp({ email, code });
        setUser(user);
        setSuccess(true);
        setTimeout(
          () => navigate(resolvePostLoginPath(user.role, from), { replace: true }),
          1200,
        );
      } else if (context === "password-reset") {
        await verifyResetOtp({ email, code });
        setSuccess(true);
        setTimeout(() => navigate(paths.resetPassword, { state: { email, code } }), 1200);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errors[0] || "الرمز المدخل غير صحيح");
      } else {
        setError("حدث خطأ في الاتصال، يرجى المحاولة لاحقاً");
      }
      setOtp(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError("");
    setLoading(true);
    
    try {
      const type = context === "password-reset" ? "PASSWORD_RESET" : "EMAIL_VERIFICATION";
      await resendOtp({ email, type });
      
      setOtp(Array(OTP_LENGTH).fill(""));
      setCountdown(60);
      setCanResend(false);
      inputsRef.current[0]?.focus();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errors[0] || "فشل إرسال الرمز");
      } else {
        setError("حدث خطأ في الاتصال");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return {
    otp,
    error,
    success,
    loading,
    countdown,
    canResend,
    inputsRef,
    context,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleVerify,
    handleResend,
    formatCountdown,
  };
}
