import type { ClipboardEvent, KeyboardEvent, MutableRefObject } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { ActionButton } from "../../components/action-button";
import { EditorShell } from "../../components/editor-shell";
import { DANGER, FAINT, FONT, INK, MUTED, PRIMARY, SUCCESS, SURFACE_TINT } from "../../components/settings-tokens";
import { UnsavedChangesDialog } from "../../components/unsaved-changes-dialog";
import type { EmailChallenge, EmailEditorErrors, EmailStep } from "../types/account.types";
import { TextField } from "./text-field";

const STEPS: readonly { id: EmailStep; label: string }[] = [
  { id: "password", label: "تأكيد الهوية" },
  { id: "email", label: "البريد الجديد" },
  { id: "code", label: "رمز التحقق" },
  { id: "done", label: "تم" },
];

const TIPS = [
  "نرسل رمزًا من 6 أرقام إلى البريد الجديد، ولا يتغير بريدك إلا بعد إدخاله.",
  "بعد التغيير سنرسل تنبيهًا إلى بريدك الحالي، وسيُسجَّل خروجك من أجهزتك الأخرى.",
];

interface EmailEditorContentProps {
  step: EmailStep;
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
  continueToEmail: () => void;
  newEmail: string;
  setNewEmail: (value: string) => void;
  backToPassword: () => void;
  send: () => void;
  challenge: EmailChallenge | null;
  digits: string[];
  digitRefs: MutableRefObject<(HTMLInputElement | null)[]>;
  setDigit: (index: number, value: string) => void;
  onDigitKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => void;
  onDigitPaste: (index: number, event: ClipboardEvent<HTMLInputElement>) => void;
  codeComplete: boolean;
  verify: () => void;
  resend: () => void;
  resendIn: number;
  expiresIn: number;
  locked: boolean;
  editEmail: () => void;
  errors: EmailEditorErrors;
  busy: "sending" | "verifying" | "resending" | null;
  close: () => void;
  finish: () => void;
  confirmingLeave: boolean;
  stay: () => void;
  leave: () => void;
}

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export function EmailEditorContent(props: EmailEditorContentProps) {
  const { step, errors, busy, close } = props;
  const current = STEPS.findIndex((candidate) => candidate.id === step);

  return (
    <>
      <EditorShell
        title="تغيير البريد الإلكتروني"
        description="سيُستخدم البريد الجديد لتسجيل الدخول وللرسائل المتعلقة بحسابك."
        tips={TIPS}
        onClose={step === "done" ? props.finish : close}
        footer={<Footer {...props} />}
      >
        <ol aria-label="خطوات تغيير البريد" className="flex items-center gap-2" style={{ fontFamily: FONT }}>
          {STEPS.map((candidate, index) => {
            // The last step is a result, not a task: once reached, every step is complete.
            const state = index < current || step === "done" ? "done" : index === current ? "current" : "todo";
            return (
              <li key={candidate.id} aria-current={state === "current" ? "step" : undefined} className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: 26, height: 26, fontSize: 12, fontWeight: 700,
                    background: state === "todo" ? SURFACE_TINT : PRIMARY,
                    color: state === "todo" ? MUTED : "#fff",
                  }}
                >
                  {state === "done" ? "✓" : index + 1}
                </span>
                <span className="hidden sm:inline truncate" style={{ fontSize: 12, fontWeight: 700, color: state === "todo" ? FAINT : INK }}>
                  {candidate.label}
                </span>
              </li>
            );
          })}
        </ol>

        {step === "password" ? (
          <form noValidate onSubmit={(event) => { event.preventDefault(); props.continueToEmail(); }}>
            <TextField
              id="email-change-password"
              label="كلمة المرور الحالية"
              type={props.showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={props.currentPassword}
              onChange={props.setCurrentPassword}
              error={errors.currentPassword}
              hint="للتأكد من أنك صاحب الحساب."
              trailing={
                <button
                  type="button"
                  onClick={props.toggleShowPassword}
                  aria-label={props.showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  aria-pressed={props.showPassword}
                  className="flex items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
                  style={{ width: 34, height: 34, background: "transparent", border: "none", color: FAINT, cursor: "pointer" }}
                >
                  {props.showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                </button>
              }
            />
          </form>
        ) : null}

        {step === "email" ? (
          <form noValidate onSubmit={(event) => { event.preventDefault(); props.send(); }}>
            <TextField
              id="email-change-new"
              label="البريد الإلكتروني الجديد"
              type="email"
              autoComplete="email"
              value={props.newEmail}
              onChange={props.setNewEmail}
              error={errors.newEmail}
              disabled={busy === "sending"}
              hint="سنرسل رمز التحقق إلى هذا البريد."
            />
          </form>
        ) : null}

        {step === "code" && props.challenge ? <CodeStep {...props} challenge={props.challenge} /> : null}

        {step === "done" ? (
          <div role="status" className="flex flex-col items-center gap-2 py-6 text-center">
            <CheckCircle2 size={40} aria-hidden style={{ color: "#27AE60" }} />
            <p style={{ fontWeight: 700, fontSize: 16, color: SUCCESS }}>تم تغيير بريدك الإلكتروني</p>
            <p style={{ fontSize: 13, color: MUTED }}>استخدم البريد الجديد لتسجيل الدخول من الآن.</p>
          </div>
        ) : null}

        {errors.general ? <p role="alert" style={{ fontSize: 13, color: DANGER, fontFamily: FONT }}>{errors.general}</p> : null}
      </EditorShell>
      <UnsavedChangesDialog open={props.confirmingLeave} onStay={props.stay} onLeave={props.leave} />
    </>
  );
}

function CodeStep(props: EmailEditorContentProps & { challenge: EmailChallenge }) {
  const { challenge, digits, errors, busy, locked } = props;
  const expired = props.expiresIn === 0;
  return (
    <div className="flex flex-col gap-3" style={{ fontFamily: FONT }}>
      <p style={{ fontSize: 13.5, color: INK }}>
        أدخل الرمز المرسل إلى{" "}
        <span dir="ltr" style={{ unicodeBidi: "isolate", fontWeight: 700 }}>{challenge.maskedEmail}</span>
      </p>
      <div role="group" aria-label={`رمز التحقق المكوّن من ${challenge.codeLength} أرقام`} dir="ltr" className="flex gap-2 justify-center">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => { props.digitRefs.current[index] = element; }}
            value={digit}
            onChange={(event) => props.setDigit(index, event.target.value)}
            onKeyDown={(event) => props.onDigitKeyDown(index, event)}
            onPaste={(event) => props.onDigitPaste(index, event)}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={challenge.codeLength}
            aria-label={`الرقم ${index + 1}`}
            aria-invalid={errors.code ? true : undefined}
            disabled={busy === "verifying" || locked || expired}
            className="text-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
            style={{ width: 44, height: 52, fontSize: 20, fontWeight: 700, color: INK, border: `1.5px solid ${errors.code ? DANGER : "rgba(78,91,146,0.2)"}`, background: "#fff" }}
          />
        ))}
      </div>
      {errors.code ? <p role="alert" className="text-center" style={{ fontSize: 12.5, color: DANGER }}>{errors.code}</p> : null}
      <p className="text-center" aria-live="polite" style={{ fontSize: 12.5, color: expired ? DANGER : FAINT }}>
        {locked ? "لا يمكن استخدام هذا الطلب بعد الآن." : expired ? "انتهت صلاحية الرمز. اطلب رمزًا جديدًا." : `ينتهي الرمز خلال ${clock(props.expiresIn)}`}
      </p>
      <div className="flex flex-wrap justify-center gap-3" style={{ fontSize: 12.5 }}>
        <button
          type="button"
          onClick={props.resend}
          disabled={props.resendIn > 0 || busy !== null || locked}
          className="rounded-lg px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
          style={{ fontFamily: FONT, fontWeight: 700, color: props.resendIn > 0 || locked ? FAINT : PRIMARY, background: "transparent", border: "none", cursor: props.resendIn > 0 || locked ? "default" : "pointer" }}
        >
          {busy === "resending" ? "جارٍ الإرسال…" : props.resendIn > 0 ? `إعادة الإرسال بعد ${props.resendIn} ث` : "إعادة إرسال الرمز"}
        </button>
        <button
          type="button"
          onClick={props.editEmail}
          disabled={busy !== null}
          className="rounded-lg px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
          style={{ fontFamily: FONT, fontWeight: 700, color: PRIMARY, background: "transparent", border: "none", cursor: "pointer" }}
        >
          تعديل البريد
        </button>
      </div>
    </div>
  );
}

function Footer(props: EmailEditorContentProps) {
  const { step, busy } = props;
  const spinner = <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden />;
  if (step === "password") {
    return (
      <>
        <ActionButton onClick={props.continueToEmail}>متابعة</ActionButton>
        <ActionButton variant="secondary" onClick={props.close}>إلغاء</ActionButton>
      </>
    );
  }
  if (step === "email") {
    return (
      <>
        <ActionButton onClick={props.send} disabled={busy !== null} aria-busy={busy === "sending" || undefined}>
          {busy === "sending" ? spinner : null} إرسال رمز التحقق
        </ActionButton>
        <ActionButton variant="secondary" onClick={props.backToPassword} disabled={busy !== null}>رجوع</ActionButton>
      </>
    );
  }
  if (step === "code") {
    return props.locked ? (
      <ActionButton onClick={props.editEmail}>البدء من جديد</ActionButton>
    ) : (
      <>
        <ActionButton onClick={props.verify} disabled={!props.codeComplete || busy !== null || props.expiresIn === 0} aria-busy={busy === "verifying" || undefined}>
          {busy === "verifying" ? spinner : null} {busy === "verifying" ? "جارٍ تحديث البريد…" : "تأكيد"}
        </ActionButton>
        <ActionButton variant="secondary" onClick={props.close} disabled={busy !== null}>إلغاء</ActionButton>
      </>
    );
  }
  return <ActionButton onClick={props.finish}>العودة إلى الحساب</ActionButton>;
}
