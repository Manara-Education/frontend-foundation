import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/shared/api";
import { getRefundRequests, submitRefundRequest } from "../services/billing.service";
import type { RefundEligibility, RefundReason, RefundRequest } from "../types/billing.types";

export const REFUND_NOTE_MAX = 1000;

/**
 * A live transaction's refund requests and the form to add one. Only an answer from the server
 * changes what is shown; a submission that got no answer is reported as unknown, never as sent.
 */
export function useRefundRequest(reference: string, live: boolean, initialEligibility: RefundEligibility) {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [eligibility, setEligibility] = useState(initialEligibility);
  const [formOpen, setFormOpen] = useState(false);
  const [reason, setReason] = useState<RefundReason | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    setEligibility(initialEligibility);
    setFormOpen(false);
    setError(null);
    if (!live) return;
    let cancelled = false;
    getRefundRequests(reference)
      .then((found) => !cancelled && setRequests(found))
      .catch(() => !cancelled && setRequests([]));
    return () => {
      cancelled = true;
    };
  }, [reference, live, initialEligibility]);

  // No reason is required: the published Terms grant the refund without one.
  const canSubmit = note.length <= REFUND_NOTE_MAX && !submitting;

  async function submit() {
    if (!canSubmit || inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const created = await submitRefundRequest(reference, reason, note);
      setRequests((current) => [created, ...current]);
      setEligibility("REQUEST_OPEN");
      setFormOpen(false);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        // One is already open — show it rather than an error.
        setRequests(await getRefundRequests(reference).catch(() => requests));
        setEligibility("REQUEST_OPEN");
        setFormOpen(false);
      } else if (err instanceof ApiError && err.statusCode >= 400 && err.statusCode < 500) {
        setError(err.errors[0] ?? "تعذّر إرسال الطلب.");
      } else {
        setError("لم نتأكد من وصول طلبك. أعد فتح العملية للتحقق قبل المحاولة مرة أخرى.");
      }
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return {
    requests,
    eligibility,
    formOpen,
    openForm: () => setFormOpen(true),
    cancel: () => {
      setFormOpen(false);
      setError(null);
    },
    reason,
    setReason,
    note,
    setNote,
    canSubmit,
    submitting,
    error,
    submit,
  };
}
