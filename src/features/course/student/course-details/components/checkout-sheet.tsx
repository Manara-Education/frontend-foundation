import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { downloadReceiptPdf } from "@/features/settings/billing/services/billing.service";
import { paths } from "@/shared/navigation/paths";
import { AlertTriangle, BookOpen, CheckCircle2, Loader2, Lock, WifiOff, X, XCircle } from "lucide-react";
import { FONT, PRIMARY } from "../formatters/course-details.formatter";
import { useCheckout } from "../hooks/use-checkout";
import type { CheckoutKind, CheckoutOutcome, CourseDetailData, CourseDetailsMode } from "../types/course-details.types";
import { CheckoutField } from "./checkout-field";

interface CheckoutSheetProps {
  course: CourseDetailData;
  kind: Exclude<CheckoutKind, "free">;
  mode: CourseDetailsMode;
  /** The offer as the page shows it — the pre-checkout price. The server charges its own figure. */
  amountLabel: string;
  /** What it buys: "شراء مرة واحدة · وصول دائم", or the plan's name and fixed term. */
  termsLabel: string;
  planId?: number | null;
  /**
   * The sheet has closed. `outcome` says what is known: `confirmed-failure` shows the page's
   * banner, `success` refreshes the page, `none` changes nothing — closing never cancels a charge.
   */
  onClose: (outcome: "none" | "success" | "confirmed-failure") => void;
  /** The one action that opens the course. Never taken automatically. */
  onGoToCourse: () => void;
}

const INK = "#1E2340";
const MUTED = "#6B7280";
const DANGER = "#B42318";

const FOCUSABLE = ["a[href]", "button:not([disabled])", "input:not([disabled])", "[tabindex]:not([tabindex='-1'])"].join(",");

/**
 * "إتمام الشراء": the checkout as a sheet — along the bottom of a phone, centred and 480px wide
 * from `sm` up. Focus is held inside while it is open and returned to the button that opened it.
 * It cannot be dismissed while a request is in flight, and dismissing it never means the charge
 * was cancelled.
 */
export function CheckoutSheet({ course, kind, mode, amountLabel, termsLabel, planId, onClose, onGoToCourse }: CheckoutSheetProps) {
  const checkout = useCheckout({ courseId: course.id, kind, planId, mode });
  const { phase, busy } = checkout;
  // The server's figure once it has answered; the page's offer until then.
  const shownAmount = checkout.quotedAmount ?? amountLabel;
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [imageFailed, setImageFailed] = useState(false);

  const closeWith = () =>
    onClose(phase === "success" ? "success" : phase === "failed" ? "confirmed-failure" : "none");
  const closeRef = useRef(closeWith);
  closeRef.current = closeWith;
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => dialogRef.current?.focus({ preventScroll: true }));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!busyRef.current) {
          event.preventDefault();
          closeRef.current();
        }
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || !dialogRef.current.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) closeWith();
      }}
      className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center sm:p-4"
      style={{ background: "rgba(10,13,40,0.6)" }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy || undefined}
        tabIndex={-1}
        dir="rtl"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="rs-sheet w-full rounded-t-[24px] sm:rounded-[24px] outline-none motion-reduce:transition-none"
        style={{ "--rs-sheet-max": "480px", background: "#FFFFFF", boxShadow: "0 30px 80px rgba(10,13,40,0.28)", fontFamily: FONT } as CSSProperties}
      >
        {/* Header */}
        <div className="flex items-center gap-3" style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(78,91,146,0.1)" }}>
          <span className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: "rgba(78,91,146,0.08)", color: PRIMARY }}>
            <Lock size={16} aria-hidden="true" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 id={titleId} style={{ fontSize: 16, fontWeight: 700, color: INK, margin: 0 }}>إتمام الشراء</h2>
            <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>اتصال مشفّر</p>
          </div>
          <button
            type="button"
            onClick={closeWith}
            disabled={busy}
            aria-label="إغلاق نافذة الشراء"
            className="rs-touch flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92] disabled:opacity-40"
            style={{ width: 36, height: 36, border: "none", background: "rgba(78,91,146,0.08)", color: MUTED, cursor: busy ? "default" : "pointer" }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="rs-sheet__body" style={{ padding: "16px 20px 8px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Order summary: what the page offers, pending the server's own price. */}
          <section aria-label="ملخص الطلب" className="flex items-center gap-3 rounded-2xl" style={{ padding: 12, background: "#F7F8FC", border: "1px solid rgba(78,91,146,0.08)" }}>
            <div className="flex items-center justify-center overflow-hidden rounded-xl flex-shrink-0" style={{ width: 64, height: 44, background: "#E7E9F4" }}>
              {course.image && !imageFailed ? (
                <img src={course.image} alt="" onError={() => setImageFailed(true)} className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={18} color="#A8AFCB" aria-hidden="true" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="rs-longform" style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: 0 }}>{course.title}</p>
              <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{termsLabel}</p>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: PRIMARY, whiteSpace: "nowrap" }}>{shownAmount}</span>
          </section>

          {checkout.offline && (phase === "review" || phase === "uncertain") && (
            <Banner tone="warning" icon={<WifiOff size={15} aria-hidden="true" />}>
              لا يوجد اتصال بالإنترنت. تحقّق من اتصالك قبل المتابعة.
            </Banner>
          )}

          {phase === "review" && checkout.quote?.simulated && (
            <Banner tone="warning" icon={<AlertTriangle size={15} aria-hidden="true" />}>
              محاكاة دفع — لا تُجرى أي عملية خصم فعلية
            </Banner>
          )}

          {phase === "review" && checkout.quote && !checkout.quote.payable && (
            <Banner tone="danger" icon={<XCircle size={15} aria-hidden="true" />}>
              {checkout.quote.unavailableReason === "ALREADY_ENTITLED"
                ? "لديك وصول إلى هذه الدورة بالفعل."
                : "الدفع غير متاح حاليًا على منارة، لذلك لا يمكن إتمام الشراء الآن."}
            </Banner>
          )}

          {(phase === "review" || phase === "submitting") && (
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                void checkout.submit();
              }}
              className="flex flex-col gap-3"
            >
              <CheckoutField label="الاسم الكامل" value={checkout.form.name} onChange={checkout.setName} placeholder="الاسم كما تريده في سجل الدفع" />
              <CheckoutField label="البريد الإلكتروني (اختياري)" value={checkout.form.email} onChange={checkout.setEmail} placeholder="name@example.com" type="email" />
              <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
            </form>
          )}

          {phase === "success" && checkout.outcome && <SuccessView outcome={checkout.outcome} />}

          {phase === "failed" && (
            <Banner tone="danger" icon={<XCircle size={16} aria-hidden="true" />} title="لم تكتمل العملية">
              {checkout.message} لم يُمنح وصول إلى الدورة.
            </Banner>
          )}

          {(phase === "uncertain" || phase === "checking") && (
            <Banner tone="warning" icon={<AlertTriangle size={16} aria-hidden="true" />} title="نتيجة غير مؤكدة">
              {checkout.statusNotConfirmed
                ? "لم نجد وصولًا مفعّلًا لهذه الدورة حتى الآن. يمكنك المحاولة مرة أخرى: إن كانت العملية الأولى قد اكتملت فلن تُنفَّذ مرة ثانية."
                : "لم يصلنا رد مؤكد. تحقّق من الحالة قبل أي محاولة جديدة."}
            </Banner>
          )}
        </div>

        <div className="rs-sheet__footer flex flex-col gap-2" style={{ padding: "10px 20px 18px" }}>
          <Actions checkout={checkout} onClose={closeWith} onGoToCourse={onGoToCourse} amountLabel={shownAmount} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function SuccessView({ outcome }: { outcome: CheckoutOutcome }) {
  return (
    <div role="status" className="flex flex-col items-center gap-2 text-center" style={{ padding: "8px 0" }}>
      <CheckCircle2 size={40} color="#1B7A43" aria-hidden="true" />
      <p style={{ fontSize: 16, fontWeight: 700, color: "#1B7A43", margin: 0 }}>
        {outcome.confirmedByStatusCheck ? "تم تفعيل وصولك إلى الدورة" : outcome.simulated ? "تمّت محاكاة الدفع بنجاح" : "تمّت العملية بنجاح"}
      </p>
      {outcome.simulated && (
        <p style={{ fontSize: 13, fontWeight: 700, color: "#8A5A00", background: "#FFF4DB", borderRadius: 10, padding: "6px 12px", margin: 0 }}>
          محاكاة دفع — لا تُجرى أي عملية خصم فعلية
        </p>
      )}
      {outcome.amountLabel && (
        <p style={{ fontSize: 13, color: INK, margin: 0 }}>
          المبلغ المسجّل: <strong>{outcome.amountLabel}</strong>
        </p>
      )}
      {outcome.receiptNumber && <ReceiptActions outcome={outcome} />}
      {outcome.paymentReference && (
        <p style={{ fontSize: 12.5, color: MUTED, margin: 0 }}>
          المرجع: <span dir="ltr" style={{ unicodeBidi: "isolate", fontWeight: 700, color: INK }}>{outcome.paymentReference}</span>
        </p>
      )}
    </div>
  );
}

function Actions({
  checkout,
  onClose,
  onGoToCourse,
  amountLabel,
}: {
  checkout: ReturnType<typeof useCheckout>;
  onClose: () => void;
  onGoToCourse: () => void;
  amountLabel: string;
}) {
  const { phase } = checkout;
  if (phase === "success") {
    return (
      <>
        <Primary onClick={onGoToCourse}>الانتقال إلى الدورة</Primary>
        <Secondary onClick={onClose}>إغلاق</Secondary>
      </>
    );
  }
  if (phase === "failed") {
    return (
      <>
        <Primary onClick={checkout.backToReview}>المحاولة مرة أخرى</Primary>
        <Secondary onClick={onClose}>إغلاق</Secondary>
      </>
    );
  }
  if (phase === "uncertain" || phase === "checking") {
    return (
      <>
        <Primary onClick={() => void checkout.checkStatus()} disabled={phase === "checking"} busy={phase === "checking"}>
          {phase === "checking" ? "جارٍ التحقق…" : "التحقق من الحالة"}
        </Primary>
        {checkout.statusNotConfirmed && <Secondary onClick={() => void checkout.retry()}>المحاولة مرة أخرى</Secondary>}
        <Secondary onClick={onClose} disabled={phase === "checking"}>إغلاق</Secondary>
      </>
    );
  }
  return (
    <>
      <Primary onClick={() => void checkout.submit()} disabled={!checkout.canPay || phase === "submitting"} busy={phase === "submitting"}>
        {phase === "submitting" ? "جارٍ معالجة الطلب… لا تغلق النافذة" : `تأكيد ودفع ${amountLabel}`}
      </Primary>
      <p style={{ fontSize: 11.5, color: MUTED, textAlign: "center", margin: 0 }}>يُحتسب المبلغ النهائي من خادم منارة.</p>
    </>
  );
}

function Banner({ tone, icon, title, children }: { tone: "danger" | "warning"; icon: ReactNode; title?: string; children: ReactNode }) {
  const danger = tone === "danger";
  return (
    <div
      role={danger ? "alert" : "status"}
      className="flex items-start gap-2.5 rounded-xl"
      style={{ padding: "12px 14px", background: danger ? "rgba(180,35,24,0.06)" : "#FFF7E6", border: `1px solid ${danger ? "rgba(180,35,24,0.18)" : "rgba(138,90,0,0.18)"}`, color: danger ? DANGER : "#8A5A00" }}
    >
      <span style={{ marginTop: 2 }}>{icon}</span>
      <div style={{ fontSize: 13, lineHeight: 1.8 }}>
        {title && <p style={{ fontWeight: 700, margin: 0 }}>{title}</p>}
        <p style={{ margin: 0 }}>{children}</p>
      </div>
    </div>
  );
}

function Primary({ onClick, disabled, busy, children }: { onClick: () => void; disabled?: boolean; busy?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy || undefined}
      className="inline-flex items-center justify-center gap-2 w-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4E5B92]"
      style={{ minHeight: 48, border: "none", fontFamily: FONT, fontSize: 14.5, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B7AB8 100%)`, opacity: disabled && !busy ? 0.5 : 1, cursor: disabled ? "default" : "pointer" }}
    >
      {busy && <Loader2 size={15} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
      {children}
    </button>
  );
}

function Secondary({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92] disabled:opacity-50"
      style={{ minHeight: 44, border: "1.5px solid rgba(78,91,146,0.14)", background: "#fff", fontFamily: FONT, fontSize: 13.5, fontWeight: 700, color: PRIMARY, cursor: disabled ? "default" : "pointer" }}
    >
      {children}
    </button>
  );
}

/** The receipt from checkout: open it in Settings, or download it through the same path Settings uses. */
function ReceiptActions({ outcome }: { outcome: CheckoutOutcome }) {
  const [state, setState] = useState<"idle" | "downloading" | "failed">("idle");
  const download = async () => {
    if (!outcome.receiptNumber || state === "downloading") return;
    setState("downloading");
    try {
      await downloadReceiptPdf(outcome.receiptNumber);
      setState("idle");
    } catch {
      setState("failed");
    }
  };
  return (
    <div className="flex flex-col items-center gap-1.5" style={{ fontSize: 12.5 }}>
      <p style={{ color: MUTED, margin: 0 }}>
        رقم الإيصال: <span dir="ltr" style={{ unicodeBidi: "isolate", fontWeight: 700, color: INK }}>{outcome.receiptNumber}</span>
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {outcome.transactionId && (
          <Link
            to={`${paths.settings.invoices}?tx=${encodeURIComponent(outcome.transactionId)}`}
            className="rounded-lg px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
            style={{ fontWeight: 700, color: PRIMARY }}
          >
            عرض الإيصال
          </Link>
        )}
        <button
          type="button"
          onClick={() => void download()}
          disabled={state === "downloading"}
          className="rounded-lg px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
          style={{ fontFamily: FONT, fontSize: "inherit", fontWeight: 700, color: PRIMARY, background: "transparent", border: "none", cursor: "pointer" }}
        >
          {state === "downloading" ? "جارٍ التحميل…" : "تحميل الإيصال"}
        </button>
      </div>
      {state === "failed" && <p role="alert" style={{ color: DANGER, margin: 0 }}>تعذّر تحميل الإيصال.</p>}
      <p style={{ color: MUTED, margin: 0 }}>تجد هذه العملية أيضًا في الإعدادات ← الفواتير والمدفوعات.</p>
    </div>
  );
}
