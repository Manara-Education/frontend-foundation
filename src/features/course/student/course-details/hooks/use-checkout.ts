import { useState } from "react";
import {
  formatCardNumber,
  formatExpiry,
  isCheckoutValid,
  sanitizeCvc,
} from "../formatters/course-details.formatter";
import { processCheckout } from "../services/course-details.service";
import type { CheckoutFormState, CheckoutStep } from "../types/course-details.types";

interface UseCheckoutArgs {
  courseId: number;
  isFree: boolean;
  onSuccess: () => void;
}

const EMPTY: CheckoutFormState = { cardNumber: "", expiry: "", cvc: "", name: "", email: "" };

export function useCheckout({ courseId, isFree, onSuccess }: UseCheckoutArgs) {
  const [step, setStep] = useState<CheckoutStep>("form");
  const [form, setForm] = useState<CheckoutFormState>(EMPTY);

  function update<K extends keyof CheckoutFormState>(key: K, value: CheckoutFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const setCardNumber = (v: string) => update("cardNumber", formatCardNumber(v));
  const setExpiry = (v: string) => update("expiry", formatExpiry(v));
  const setCvc = (v: string) => update("cvc", sanitizeCvc(v));
  const setName = (v: string) => update("name", v);
  const setEmail = (v: string) => update("email", v);

  const canPay = isCheckoutValid(form, isFree);

  async function handlePay() {
    if (!canPay) return;
    setStep("processing");
    await processCheckout(courseId, isFree);
    setStep("success");
    setTimeout(onSuccess, 1300);
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
