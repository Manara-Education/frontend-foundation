import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "@/shared/api";
import { useAuth } from "@/shared/auth";
import { paths } from "@/shared/navigation/paths";
import { useUnsavedChangesGuard } from "../../hooks/use-unsaved-changes-guard";
import { resendEmailChange, startEmailChange, verifyEmailChange } from "../services/email-change.service";
import type { EmailChallenge, EmailEditorErrors, EmailStep } from "../types/account.types";

const FAILED = "تعذّر إكمال الطلب. تحقّق من اتصالك ثم حاول مرة أخرى.";
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The email change, one step at a time: current password → new address → code → done.
 *
 * The password is held only in this hook's state, sent once with the new address (the server checks
 * it there, not in a separate call), and cleared as soon as it has been sent. Deadlines come from the
 * server; the ticking clock here only redraws the countdowns.
 */
export function useEmailEditor() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [step, setStep] = useState<EmailStep>("password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [challenge, setChallenge] = useState<EmailChallenge | null>(null);
  const [digits, setDigits] = useState<string[]>([]);
  const [errors, setErrors] = useState<EmailEditorErrors>({});
  const [busy, setBusy] = useState<"sending" | "verifying" | "resending" | null>(null);
  const [locked, setLocked] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== "code") return;
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, [step]);

  const dirty = step !== "done" && (currentPassword !== "" || newEmail !== "" || step === "code");
  const guard = useUnsavedChangesGuard(dirty && busy === null);

  const clearError = (field: keyof EmailEditorErrors) =>
    setErrors((current) => ({ ...current, [field]: undefined, general: undefined }));

  // ── password → email ─────────────────────────────────────────────────────
  const continueToEmail = () => {
    if (!currentPassword) {
      setErrors({ currentPassword: "أدخل كلمة المرور الحالية." });
      return;
    }
    setErrors({});
    setStep("email");
  };

  // ── email → code ─────────────────────────────────────────────────────────
  const send = async () => {
    if (busy) return;
    const address = newEmail.trim();
    if (!EMAIL_SHAPE.test(address)) {
      setErrors({ newEmail: "أدخل بريدًا إلكترونيًا صحيحًا." });
      return;
    }
    if (user && address.toLowerCase() === user.email.toLowerCase()) {
      setErrors({ newEmail: "هذا هو بريدك الإلكتروني الحالي بالفعل." });
      return;
    }
    setBusy("sending");
    setErrors({});
    try {
      const issued = await startEmailChange(currentPassword, address);
      setCurrentPassword("");
      setChallenge(issued);
      setDigits(Array.from({ length: issued.codeLength }, () => ""));
      setLocked(false);
      setNow(Date.now());
      setStep("code");
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_CHANGE_PASSWORD_INVALID") {
        setCurrentPassword("");
        setStep("password");
        setErrors({ currentPassword: err.errors[0] });
      } else if (err instanceof ApiError && err.statusCode === 400) {
        const field = err.errors.find((message) => message.startsWith("newEmail: "));
        setErrors({ newEmail: field ? field.slice("newEmail: ".length) : err.errors[0] ?? FAILED });
      } else if (err instanceof ApiError && err.statusCode === 429) {
        setErrors({ general: err.errors[0] ?? FAILED });
      } else if (!(err instanceof ApiError && err.statusCode === 401)) {
        setErrors({ general: FAILED });
      }
    } finally {
      setBusy(null);
    }
  };

  // ── code ─────────────────────────────────────────────────────────────────
  const code = digits.join("");
  const codeComplete = challenge != null && code.length === challenge.codeLength && /^\d+$/.test(code);

  const setDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length > 1) {
      fillFrom(index, clean);
      return;
    }
    setDigits((current) => current.map((digit, i) => (i === index ? clean : digit)));
    clearError("code");
    if (clean && index < digits.length - 1) digitRefs.current[index + 1]?.focus();
  };

  const fillFrom = (index: number, text: string) => {
    const incoming = text.replace(/\D/g, "").split("");
    setDigits((current) => current.map((digit, i) => (i >= index && incoming[i - index] != null ? incoming[i - index] : digit)));
    clearError("code");
    digitRefs.current[Math.min(index + incoming.length, digits.length - 1)]?.focus();
  };

  const onDigitKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
      setDigits((current) => current.map((digit, i) => (i === index - 1 ? "" : digit)));
      event.preventDefault();
    } else if (event.key === "Enter" && codeComplete) {
      void verify();
    }
  };

  const onDigitPaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    fillFrom(index, event.clipboardData.getData("text"));
  };

  const verify = async () => {
    if (!challenge || !codeComplete || busy || locked) return;
    setBusy("verifying");
    setErrors({});
    try {
      const profile = await verifyEmailChange(challenge.requestId, code);
      if (user) setUser({ ...user, email: profile.email, fullName: profile.fullName, avatarUrl: profile.avatarUrl });
      guard.release();
      setStep("done");
    } catch (err) {
      setDigits((current) => current.map(() => ""));
      digitRefs.current[0]?.focus();
      if (err instanceof ApiError && err.code === "EMAIL_CHANGE_LOCKED") {
        setLocked(true);
        setErrors({ general: err.errors[0] });
      } else if (err instanceof ApiError && (err.code === "EMAIL_CHANGE_CODE_INVALID" || err.code === "EMAIL_CHANGE_EXPIRED")) {
        setErrors({ code: err.errors[0] });
      } else if (err instanceof ApiError && err.code === "EMAIL_CHANGE_UNAVAILABLE") {
        setLocked(true);
        setErrors({ general: err.errors[0] });
      } else if (!(err instanceof ApiError && err.statusCode === 401)) {
        setErrors({ general: FAILED });
      }
    } finally {
      setBusy(null);
    }
  };

  const resend = async () => {
    if (!challenge || busy || now < challenge.resendAvailableAt) return;
    setBusy("resending");
    setErrors({});
    try {
      const issued = await resendEmailChange(challenge.requestId);
      setChallenge(issued);
      setDigits(Array.from({ length: issued.codeLength }, () => ""));
      setNow(Date.now());
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_CHANGE_LOCKED") setLocked(true);
      if (!(err instanceof ApiError && err.statusCode === 401)) {
        setErrors({ general: err instanceof ApiError ? err.errors[0] ?? FAILED : FAILED });
      }
    } finally {
      setBusy(null);
    }
  };

  /** Back to the start, forgetting the request; the server's own limits still apply. */
  const restart = useCallback(() => {
    setStep("password");
    setChallenge(null);
    setDigits([]);
    setLocked(false);
    setErrors({});
    setCurrentPassword("");
  }, []);

  const secondsUntil = (deadline: number | undefined) =>
    deadline == null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));

  return {
    step,
    currentPassword,
    setCurrentPassword: (value: string) => {
      setCurrentPassword(value);
      clearError("currentPassword");
    },
    showPassword,
    toggleShowPassword: () => setShowPassword((shown) => !shown),
    continueToEmail,
    newEmail,
    setNewEmail: (value: string) => {
      setNewEmail(value);
      clearError("newEmail");
    },
    backToPassword: () => setStep("password"),
    send,
    challenge,
    digits,
    digitRefs,
    setDigit,
    onDigitKeyDown,
    onDigitPaste,
    codeComplete,
    verify,
    resend,
    resendIn: secondsUntil(challenge?.resendAvailableAt),
    expiresIn: secondsUntil(challenge?.expiresAt),
    locked,
    restart,
    editEmail: () => {
      restart();
      setStep("password");
    },
    errors,
    busy,
    close: () => navigate(paths.settings.account),
    finish: () => navigate(paths.settings.account, { state: { notice: "email-changed" } }),
    confirmingLeave: guard.confirmingLeave,
    stay: guard.stay,
    leave: guard.leave,
  };
}
