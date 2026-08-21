import { useState } from "react";
import { ApiError } from "@/shared/api";
import {
  formatCardNumber,
  formatExpiry,
  isCheckoutValid,
  sanitizeCvc,
} from "../formatters/course-details.formatter";
import {
  enrollFree,
  purchaseCourse,
  subscribeToCourse,
} from "../services/course-details.service";
import type {
  CheckoutFormState,
  CheckoutKind,
  CheckoutStep,
} from "../types/course-details.types";

interface UseCheckoutArgs {
  courseId: number;
  kind: CheckoutKind;
  /** The plan the learner chose. Required by the subscription path, ignored by the others. */
  planId?: number | null;
  onSuccess: () => void;
  /**
   * Raised when the backend refuses the checkout. The screen already has a place to say so —
   * the reference's "لم تكتمل عملية الدفع" notice on the CTA card — so a failure is reported
   * through that rather than given a second surface of its own.
   */
  onFailure: () => void;
}

const EMPTY: CheckoutFormState = { cardNumber: "", expiry: "", cvc: "", name: "", email: "" };

/**
 * Drives the checkout modal.
 *
 * The three paths differ only in what they send: nothing for a free course, an instrument
 * for a purchase, an instrument plus the chosen plan's id for a subscription. What each one
 * costs, and how long it lasts, is the backend's decision — this hook has no figure to send
 * and none to check.
 */
export function useCheckout({ courseId, kind, planId, onSuccess, onFailure }: UseCheckoutArgs) {
  const [step, setStep] = useState<CheckoutStep>("form");
  const [form, setForm] = useState<CheckoutFormState>(EMPTY);

  const isFree = kind === "free";

  function update<K extends keyof CheckoutFormState>(key: K, value: CheckoutFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const setCardNumber = (v: string) => update("cardNumber", formatCardNumber(v));
  const setExpiry = (v: string) => update("expiry", formatExpiry(v));
  const setCvc = (v: string) => update("cvc", sanitizeCvc(v));
  const setName = (v: string) => update("name", v);
  const setEmail = (v: string) => update("email", v);

  // A subscription cannot be paid for until a plan is selected; the selector always
  // pre-selects one, so this only ever blocks a course whose plans failed to load.
  const canPay = isCheckoutValid(form, isFree) && (kind !== "subscription" || planId != null);

  async function handlePay() {
    if (!canPay) return;
    setStep("processing");
    try {
      const paymentMethod = {
        cardNumber: form.cardNumber,
        expiry: form.expiry,
        cvc: form.cvc,
        name: form.name,
        email: form.email || undefined,
      };

      if (kind === "free") {
        await enrollFree(courseId);
      } else if (kind === "subscription") {
        await subscribeToCourse(courseId, planId!, paymentMethod);
      } else {
        await purchaseCourse(courseId, paymentMethod);
      }

      setStep("success");
      setTimeout(onSuccess, 1300);
    } catch (err) {
      // The backend refuses a malformed card, a plan that is not this course's, and a course
      // that is not for sale. All of them land on the same notice the reference already shows
      // when a payment does not complete.
      console.error("Checkout failed", err instanceof ApiError ? err.errors : err);
      setStep("form");
      onFailure();
    }
  }

  return {
    step,
    form,
    canPay,
    setCardNumber,
    setExpiry,
    setCvc,
    setName,
    setEmail,
    handlePay,
  };
}
