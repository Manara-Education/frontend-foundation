import { Loader2 } from "lucide-react";
import { Link } from "react-router";
import { PUBLIC_BUSINESS_FACTS } from "@/shared/business/public-business-facts";
import { paths } from "@/shared/navigation/paths";
import { BORDER, DANGER, FAINT, FONT, INK, MUTED, PRIMARY } from "../../components/settings-tokens";
import { REFUND_REASON_LABELS } from "../formatters/billing.formatter";
import { REFUND_NOTE_MAX, useRefundRequest } from "../hooks/use-refund-request";
import type { RefundReason, TransactionDetail } from "../types/billing.types";

const POLICY_LINK = { color: PRIMARY, fontWeight: 600, textDecoration: "underline" } as const;
const REASONS = Object.keys(REFUND_REASON_LABELS) as RefundReason[];

function Policy() {
  return <Link to={PUBLIC_BUSINESS_FACTS.legalLinks.refundPolicy} style={POLICY_LINK}>سياسة الإلغاء والاسترداد</Link>;
}

/**
 * Refund requests for a live payment. Shown only for LIVE records: a simulated or legacy row has no
 * money this platform received, and the drawer already says so. Nothing here says money was, or will
 * be, returned — only the transaction's refunded amount can say that.
 */
export function RefundRequestPanel({ detail }: { detail: TransactionDetail }) {
  const live = detail.row.provenance === "LIVE";
  const refund = useRefundRequest(detail.row.reference, live, detail.refundEligibility);
  if (!live) return null;
  const latest = refund.requests[0];
  const { eligibility } = refund;
  if (!latest && !["ELIGIBLE", "UNAVAILABLE", "WINDOW_CLOSED", "REQUEST_OPEN"].includes(eligibility)) return null;

  return (
    <section aria-label="طلب استرداد" className="flex flex-col gap-2 rounded-2xl p-4" style={{ border: `1.5px solid ${BORDER}`, fontFamily: FONT }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: INK }}>طلب استرداد</p>

      {latest && (
        <div className="flex flex-col gap-1" style={{ fontSize: 12.5, color: MUTED }}>
          <p><span style={{ color: INK, fontWeight: 700 }}>{latest.statusLabel}</span>، {latest.createdLabel}</p>
          <p>{[latest.reasonLabel, latest.amountLabel].filter(Boolean).join("، ")}</p>
          {latest.decisionNote && <p>{latest.decisionNote}</p>}
          {latest.status !== "REJECTED" && (
            <p style={{ color: FAINT }}>لا يعني الطلب إعادة المبلغ؛ يظهر المبلغ المسترد في تفاصيل العملية عند إتمامه فعليًا.</p>
          )}
        </div>
      )}

      {eligibility === "UNAVAILABLE" && (
        <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.8 }}>
          لا يمكن تقديم طلب الاسترداد إلكترونيًا حاليًا. راجع <Policy /> ثم{" "}
          <Link to={paths.contact} style={POLICY_LINK}>تواصل معنا</Link>.
        </p>
      )}
      {eligibility === "WINDOW_CLOSED" && !latest && (
        <p style={{ fontSize: 12.5, color: MUTED }}>انتهت مدة طلب الاسترداد لهذه العملية. راجع <Policy />.</p>
      )}

      {eligibility === "ELIGIBLE" && !refund.formOpen && (
        <>
          <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.8 }}>يمكنك طلب استرداد هذه العملية وفق <Policy />، دون الحاجة إلى ذكر سبب.</p>
          <button
            type="button"
            onClick={refund.openForm}
            className="self-start rounded-xl px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4E5B92]"
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: PRIMARY, background: "transparent", border: `1.5px solid ${PRIMARY}` }}
          >
            طلب استرداد
          </button>
        </>
      )}

      {eligibility === "ELIGIBLE" && refund.formOpen && (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void refund.submit();
          }}
        >
          <fieldset className="flex flex-col gap-1.5" disabled={refund.submitting}>
            <legend style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 6 }}>سبب الطلب (اختياري)</legend>
            {REASONS.map((reason) => (
              <label key={reason} className="flex items-center gap-2" style={{ fontSize: 13, color: INK }}>
                <input type="radio" name="refund-reason" value={reason} checked={refund.reason === reason} onChange={() => refund.setReason(reason)} />
                {REFUND_REASON_LABELS[reason]}
              </label>
            ))}
          </fieldset>
          <label className="flex flex-col gap-1" style={{ fontSize: 13, color: INK }}>
            تفاصيل إضافية (اختياري)
            <textarea
              value={refund.note}
              onChange={(event) => refund.setNote(event.target.value)}
              maxLength={REFUND_NOTE_MAX}
              rows={3}
              disabled={refund.submitting}
              className="rounded-xl p-2"
              style={{ border: `1.5px solid ${BORDER}`, fontFamily: FONT, fontSize: 13 }}
            />
            <span style={{ fontSize: 11.5, color: FAINT }}>{refund.note.length.toLocaleString("ar-EG")} / {REFUND_NOTE_MAX.toLocaleString("ar-EG")}</span>
          </label>
          <p style={{ fontSize: 12, color: FAINT, lineHeight: 1.8 }}>
            تقديم الطلب لا يعني الموافقة عليه، ولا يُعاد أي مبلغ قبل مراجعته وإتمام الاسترداد.
          </p>
          {refund.error && <p role="alert" style={{ fontSize: 12.5, color: DANGER }}>{refund.error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!refund.canSubmit}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 disabled:opacity-60"
              style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: "#fff", background: PRIMARY, border: "none" }}
            >
              {refund.submitting && <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              إرسال الطلب
            </button>
            <button
              type="button"
              onClick={refund.cancel}
              disabled={refund.submitting}
              className="rounded-xl px-4 py-2"
              style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: MUTED, background: "transparent", border: `1.5px solid ${BORDER}` }}
            >
              إلغاء
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
