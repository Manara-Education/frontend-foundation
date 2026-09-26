import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/shared/api";
import { useAuth } from "@/shared/auth";
import { isCheckoutValid } from "../formatters/course-details.formatter";
import {
  loadCourseDetail,
  purchaseCourse,
  subscribeToCourse,
} from "../services/course-details.service";
import type {
  CheckoutFormState,
  CheckoutKind,
  CheckoutOutcome,
  CheckoutPhase,
  CourseDetailsMode,
} from "../types/course-details.types";

interface UseCheckoutArgs {
  courseId: number;
  kind: Exclude<CheckoutKind, "free">;
  /** The plan the learner chose. Required by the subscription path, ignored by the other. */
  planId?: number | null;
  /** How the course page was opened, so a status check reads the course the same way. */
  mode: CourseDetailsMode;
}

const REFUSED = "لم تكتمل العملية. راجع البيانات ثم حاول مرة أخرى.";

/**
 * Drives the checkout sheet as a state machine: review → submitting → success, failed or
 * uncertain.
 *
 * What the checkout costs is the server's decision; nothing here sends or checks an amount.
 * The server also makes a repeat safe: its idempotency key is fixed per learner, course and
 * purpose, and a course the learner already holds is answered as held without charging again.
 * That is what lets an uncertain outcome offer "check status" and a retry — the retry is the
 * same logical checkout, not a new payment attempt.
 *
 * A ref, not only the phase, guards against a second submission: two clicks in one frame both
 * read the same phase from their render.
 */
export function useCheckout({ courseId, kind, planId, mode }: UseCheckoutArgs) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<CheckoutPhase>("review");
  const [form, setForm] = useState<CheckoutFormState>({ name: user?.fullName ?? "", email: user?.email ?? "" });
  const [outcome, setOutcome] = useState<CheckoutOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [statusNotConfirmed, setStatusNotConfirmed] = useState(false);
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && navigator.onLine === false);
  const inFlight = useRef(false);

  // Advisory only: it explains a failure faster, it never decides an outcome.
  useEffect(() => {
    const update = () => setOffline(navigator.onLine === false);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const canPay = isCheckoutValid(form, false) && (kind !== "subscription" || planId != null);
  const busy = phase === "submitting" || phase === "checking";

  async function submit() {
    if (!canPay || inFlight.current) return;
    inFlight.current = true;
    setPhase("submitting");
    setMessage(null);
    setStatusNotConfirmed(false);
    try {
      const paymentMethod = { name: form.name.trim(), email: form.email.trim() || undefined };
      const response =
        kind === "subscription"
          ? await subscribeToCourse(courseId, planId!, paymentMethod)
          : await purchaseCourse(courseId, paymentMethod);
      setOutcome({
        paymentReference: response.paymentReference ?? null,
        simulated: response.simulated === true,
        confirmedByStatusCheck: false,
      });
      setPhase("success");
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        // The shared client has signed the app out; the route guard takes over.
        setPhase("review");
      } else if (err instanceof ApiError && err.statusCode >= 400 && err.statusCode < 500) {
        setMessage(err.errors[0] ?? REFUSED);
        setPhase("failed");
      } else {
        // No answer (offline, timeout, lost response) or a server fault: it may have completed.
        setPhase("uncertain");
      }
    } finally {
      inFlight.current = false;
    }
  }

  /** Asks the course, not the checkout, whether access now exists. Grants nothing. */
  async function checkStatus() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPhase("checking");
    try {
      const course = await loadCourseDetail(courseId, mode);
      if (course.access.entitled) {
        setOutcome({ paymentReference: null, simulated: false, confirmedByStatusCheck: true });
        setPhase("success");
      } else {
        setStatusNotConfirmed(true);
        setPhase("uncertain");
      }
    } catch {
      setStatusNotConfirmed(false);
      setPhase("uncertain");
    } finally {
      inFlight.current = false;
    }
  }

  return {
    phase,
    busy,
    form,
    canPay,
    offline,
    outcome,
    message,
    statusNotConfirmed,
    setName: (name: string) => setForm((prev) => ({ ...prev, name })),
    setEmail: (email: string) => setForm((prev) => ({ ...prev, email })),
    submit,
    retry: submit,
    checkStatus,
    backToReview: () => setPhase("review"),
  };
}
