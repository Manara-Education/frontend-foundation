/** The fixed inquiry topics the form offers — must match `contact/dto/ContactTopic` on the backend. */
export const CONTACT_TOPICS = ["استفسار عام", "الدورات", "الحساب", "المدفوعات", "مشكلة تقنية"] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export interface ContactFormState {
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export interface ContactFormErrors {
  name?: string;
  email?: string;
  message?: string;
  general?: string;
}

export type ContactSubmitStatus = "idle" | "submitting" | "success" | "failed";
