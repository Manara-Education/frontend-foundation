import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { Link } from "react-router";
import { BORDER, FONT, PRIMARY, TEXT, TEXT_LIGHT, TEXT_MUTED } from "@/features/landing/components/theme";
import { paths } from "@/shared/navigation/paths";
import { CONTACT_TOPICS } from "../types/contact.types";
import { useContactForm } from "../hooks/use-contact-form";

const FIELD_STYLE = {
  inlineSize: "100%",
  minBlockSize: 48,
  paddingBlock: 12,
  paddingInline: 14,
  borderRadius: 12,
  border: `1.5px solid rgba(78,91,146,0.18)`,
  background: "#FFFFFF",
  fontFamily: FONT,
  fontSize: 14.5,
  color: TEXT,
  lineHeight: 1.7,
} as const;

const linkStyle = { color: PRIMARY, fontWeight: 600, textDecoration: "none", borderBlockEnd: "1px solid rgba(78,91,146,0.35)" } as const;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#B42318", lineHeight: 1.7, margin: "8px 0 0", fontFamily: FONT }}>
      <AlertCircle size={14} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0 }} />
      {message}
    </p>
  );
}

export function ContactForm() {
  const { form, errors, status, onName, onEmail, onTopic, onMessage, handleSubmit, resetForm } = useContactForm();

  return (
    <section
      aria-labelledby="form-heading"
      style={{ flex: "1 1 400px", minInlineSize: 0, background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 22, padding: "clamp(22px, 4vw, 34px)", boxShadow: "0 2px 16px rgba(78,91,146,0.05)" }}
    >
      <h2 id="form-heading" style={{ fontWeight: 700, fontSize: 18, color: TEXT, lineHeight: 1.6, margin: "0 0 20px", fontFamily: FONT }}>
        أرسل رسالة
      </h2>

      {status === "success" ? (
        <div role="status" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14, paddingBlock: 26 }}>
          <span style={{ inlineSize: 46, blockSize: 46, borderRadius: 15, background: "rgba(34,197,94,0.12)", color: "#15803D", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={22} strokeWidth={2} aria-hidden="true" />
          </span>
          <p style={{ fontWeight: 700, fontSize: 17, color: TEXT, margin: 0, fontFamily: FONT }}>وصلتنا رسالتك</p>
          <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.9, margin: 0, fontFamily: FONT }}>
            سنراجع رسالتك ونتواصل معك على البريد الإلكتروني الذي أدخلته.
          </p>
          <button
            type="button"
            onClick={resetForm}
            className="focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ minBlockSize: 44, paddingInline: 18, borderRadius: 12, border: "1.5px solid rgba(78,91,146,0.2)", background: "#FFFFFF", fontFamily: FONT, fontSize: 14, fontWeight: 600, color: PRIMARY, cursor: "pointer", outlineColor: PRIMARY }}
          >
            إرسال رسالة أخرى
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {status === "failed" && (
            <div role="alert" style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "16px 18px", borderRadius: 14, background: "rgba(180,35,24,0.05)", border: "1px solid rgba(180,35,24,0.25)" }}>
              <AlertCircle size={18} strokeWidth={1.9} aria-hidden="true" style={{ color: "#B42318", flexShrink: 0, marginBlockStart: 2 }} />
              <p style={{ fontSize: 13.5, color: "#7A1B12", lineHeight: 1.85, margin: 0, overflowWrap: "anywhere", fontFamily: FONT }}>
                تعذّر إرسال رسالتك الآن، ولم تُحفظ عندنا. نصّ رسالتك ما زال في النموذج — أعد المحاولة
                {errors.general ? `: ${errors.general}` : "."}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="contact-name" style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: TEXT, marginBlockEnd: 8, fontFamily: FONT }}>
              الاسم
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={onName}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              style={FIELD_STYLE}
            />
            <FieldError id="contact-name-error" message={errors.name} />
          </div>

          <div>
            <label htmlFor="contact-email" style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: TEXT, marginBlockEnd: 8, fontFamily: FONT }}>
              البريد الإلكتروني
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              value={form.email}
              onChange={onEmail}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              style={{ ...FIELD_STYLE, textAlign: "left", unicodeBidi: "isolate" }}
            />
            <FieldError id="contact-email-error" message={errors.email} />
          </div>

          <div>
            <label htmlFor="contact-topic" style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: TEXT, marginBlockEnd: 8, fontFamily: FONT }}>
              نوع الاستفسار
            </label>
            <select id="contact-topic" name="topic" value={form.topic} onChange={onTopic} style={{ ...FIELD_STYLE, paddingInlineEnd: 14 }}>
              {CONTACT_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contact-message" style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: TEXT, marginBlockEnd: 8, fontFamily: FONT }}>
              الرسالة
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              value={form.message}
              onChange={onMessage}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? "contact-message-error" : undefined}
              style={{ ...FIELD_STYLE, lineHeight: 1.9, resize: "vertical", minBlockSize: 140 }}
            />
            <FieldError id="contact-message-error" message={errors.message} />
          </div>

          <p style={{ fontSize: 12.5, color: TEXT_LIGHT, lineHeight: 1.9, margin: 0, overflowWrap: "anywhere", fontFamily: FONT }}>
            نستخدم بياناتك للرد على رسالتك فقط. اقرأ{" "}
            <Link to={paths.privacy} style={linkStyle}>
              سياسة الخصوصية
            </Link>
            . لا تشاركنا كلمة المرور أو بيانات بطاقتك البنكية.
          </p>

          <div>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                minBlockSize: 52,
                paddingInline: 30,
                borderRadius: 14,
                border: "none",
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`,
                color: "#FFFFFF",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 15,
                cursor: status === "submitting" ? "default" : "pointer",
                opacity: status === "submitting" ? 0.75 : 1,
                outlineColor: PRIMARY,
              }}
            >
              <Send size={16} strokeWidth={1.9} aria-hidden="true" style={{ flexShrink: 0 }} />
              {status === "submitting" ? "جارٍ الإرسال…" : "إرسال الرسالة"}
            </button>
          </div>

          <p aria-live="polite" className="sr-only">
            {status === "submitting" ? "جارٍ إرسال رسالتك…" : ""}
            {Object.keys(errors).length > 0 && status !== "submitting"
              ? `النموذج يحتوي على ${Object.keys(errors).length} حقلًا يحتاج إلى تصحيح.`
              : ""}
          </p>
        </form>
      )}
    </section>
  );
}
