import { LandingFooter } from "@/features/landing/components/landing-footer";
import { PublicHeader } from "@/features/landing/components/public-header";
import { PublicBreadcrumb } from "@/features/landing/components/public-breadcrumb";
import { FONT, TEXT, TEXT_MUTED, BG_SOFT } from "@/features/landing/components/theme";
import { ContactForm } from "../components/contact-form";
import { ContactSupportChannels } from "../components/contact-support-channels";

export function ContactPage() {
  return (
    <div dir="rtl" style={{ background: BG_SOFT, minHeight: "100dvh", fontFamily: FONT, display: "flex", flexDirection: "column" }}>
      <PublicHeader />

      <main style={{ flex: "1 1 auto", inlineSize: "100%", maxInlineSize: 1100, margin: "0 auto", padding: "clamp(20px, 4vw, 36px) clamp(16px, 4vw, 40px) clamp(56px, 8vw, 84px)" }}>
        <PublicBreadcrumb current="تواصل معنا" />

        <header style={{ marginBlockEnd: 22 }}>
          <h1 style={{ fontWeight: 800, fontSize: "clamp(26px, 4vw, 36px)", color: TEXT, lineHeight: 1.35, margin: "0 0 12px", overflowWrap: "anywhere" }}>
            تواصل معنا
          </h1>
          <p style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.95, margin: 0, maxInlineSize: 620, overflowWrap: "anywhere" }}>
            لديك سؤال أو تحتاج إلى مساعدة؟ يسعدنا تواصلك معنا.
          </p>
        </header>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
          <aside style={{ flex: "1 1 300px", minInlineSize: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            <ContactSupportChannels />
          </aside>
          <ContactForm />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
