import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ApiError } from "@/shared/api";
import { submitContact } from "../services/contact.service";
import type {
  ContactFormErrors,
  ContactFormState,
  ContactSubmitStatus,
  ContactTopic,
} from "../types/contact.types";
import { CONTACT_TOPICS } from "../types/contact.types";

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

const INITIAL_FORM: ContactFormState = {
  name: "",
  email: "",
  topic: CONTACT_TOPICS[0],
  message: "",
};

function validate(form: ContactFormState): ContactFormErrors {
  const errors: ContactFormErrors = {};
  if (!form.name.trim()) errors.name = "يُرجى كتابة اسمك.";
  const email = form.email.trim();
  if (!email) errors.email = "يُرجى كتابة بريدك الإلكتروني.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "تحقّق من صيغة البريد الإلكتروني، مثال: name@example.com";
  if (!form.message.trim()) errors.message = "يُرجى كتابة رسالتك.";
  return errors;
}

/**
 * Owns the contact form's whole lifecycle: typing, client-side validation, submitting,
 * success and failure — the same shape `useForgotPassword` uses, extended for four fields and
 * an explicit success screen instead of a redirect.
 *
 * A failure never clears `form`: the visitor's typed message is what a retry needs, and losing
 * it on a transient provider error would be worse than the error itself.
 */
export function useContactForm() {
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<ContactSubmitStatus>("idle");

  const onName = (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, name: e.target.value }));
  const onEmail = (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, email: e.target.value }));
  const onTopic = (e: ChangeEvent<HTMLSelectElement>) => setForm((f) => ({ ...f, topic: e.target.value as ContactTopic }));
  const onMessage = (e: ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, message: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      await submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        topic: form.topic,
        message: form.message.trim(),
      });
      setForm(INITIAL_FORM);
      setStatus("success");
    } catch (err) {
      setStatus("failed");
      setErrors({ general: err instanceof ApiError ? err.errors[0] : undefined });
    }
  };

  const resetForm = () => {
    setStatus("idle");
    setErrors({});
  };

  return { form, errors, status, onName, onEmail, onTopic, onMessage, handleSubmit, resetForm };
}
