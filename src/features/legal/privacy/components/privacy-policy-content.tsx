import type { ReactNode } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { BORDER, FONT, PRIMARY, TEXT, TEXT_MUTED } from "@/features/landing/components/theme";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { PublicHeader } from "@/features/landing/components/public-header";
import { PublicBreadcrumb } from "@/features/landing/components/public-breadcrumb";
import { TermsSectionNav } from "@/features/legal/terms/components/terms-section-nav";
import { Spinner } from "@/shared/components";
import type { PrivacyPolicyViewState } from "../types/privacy-policy.types";
import { PrivacyPolicyDocument } from "./privacy-policy-document";
import { PrivacyPolicyMetadata } from "./privacy-policy-metadata";

const TITLE_ID = "privacy-title";

function PrivacyShell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" lang="ar" style={{ minHeight: "100dvh", background: "#F8F9FD", fontFamily: FONT, display: "flex", flexDirection: "column" }}>
      <PublicHeader />
      <main
        style={{ flex: "1 1 auto", inlineSize: "100%", maxInlineSize: 1100, margin: "0 auto", padding: "clamp(20px, 4vw, 36px) clamp(16px, 4vw, 40px) clamp(56px, 8vw, 84px)" }}
      >
        <PublicBreadcrumb current="سياسة الخصوصية" />
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}

function PrivacyNotice({ title, body, onRetry }: { title: string; body: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="rs-longform"
      style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 24, padding: "clamp(28px, 5vw, 44px)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16, maxInlineSize: 640, margin: "0 auto" }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", inlineSize: 48, blockSize: 48, borderRadius: 16, background: "rgba(245,166,35,0.12)", color: "#B47008" }}>
        <AlertTriangle size={22} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: TEXT, margin: 0 }}>{title}</h1>
      <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT_MUTED, lineHeight: 2, margin: 0 }}>{body}</p>
      <button
        type="button"
        onClick={onRetry}
        className="focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FONT, fontWeight: 600, fontSize: 14, color: "#FFFFFF", background: `linear-gradient(135deg, ${PRIMARY} 0%, #3A4370 100%)`, border: "none", borderRadius: 12, padding: "11px 20px", minBlockSize: 44, cursor: "pointer", outlineColor: PRIMARY }}
      >
        <RotateCw size={15} strokeWidth={2} aria-hidden="true" />
        إعادة المحاولة
      </button>
    </div>
  );
}

/**
 * The public privacy policy screen. Four states, and only `ready` shows policy text — the text the
 * server published. A failure never falls back to a draft or to text bundled with the site.
 */
export function PrivacyPolicyContent({ state, onRetry }: { state: PrivacyPolicyViewState; onRetry: () => void }) {
  if (state.status === "loading") {
    return (
      <PrivacyShell>
        <div role="status" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "80px 0" }}>
          <Spinner size="lg" />
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT_MUTED, margin: 0 }}>جارٍ تحميل سياسة الخصوصية…</p>
        </div>
      </PrivacyShell>
    );
  }

  if (state.status === "not-published") {
    return (
      <PrivacyShell>
        <PrivacyNotice
          title="سياسة الخصوصية لم تُنشر بعد"
          body="لم تُنشر نسخة معتمدة من سياسة الخصوصية حتى الآن، ولا نعرض نصًا غير معتمد بدلًا منها. يُرجى العودة لاحقًا."
          onRetry={onRetry}
        />
      </PrivacyShell>
    );
  }

  if (state.status === "error") {
    return (
      <PrivacyShell>
        <PrivacyNotice
          title="تعذّر تحميل سياسة الخصوصية"
          body="لم نتمكن من تحميل النسخة المنشورة من سياسة الخصوصية. تحقق من اتصالك بالإنترنت ثم أعد المحاولة."
          onRetry={onRetry}
        />
      </PrivacyShell>
    );
  }

  const { policy } = state;

  return (
    <PrivacyShell>
      <header style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 24, padding: "clamp(24px, 4vw, 36px)", marginBlockEnd: 28, display: "flex", flexDirection: "column", gap: 14 }}>
        <h1 id={TITLE_ID} className="rs-longform" style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(24px, 4vw, 34px)", color: TEXT, lineHeight: 1.4, margin: 0, overflowWrap: "anywhere" }}>
          {policy.title}
        </h1>
        <PrivacyPolicyMetadata policy={policy} />
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="w-full lg:w-[292px] lg:shrink-0 lg:sticky lg:top-6">
          <TermsSectionNav sections={policy.sections} />
        </aside>

        <div className="min-w-0 flex-1" style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 24, padding: "clamp(24px, 4vw, 44px)" }}>
          <PrivacyPolicyDocument policy={policy} titleId={TITLE_ID} />
          <footer style={{ marginBlockStart: 40, paddingBlockStart: 20, borderTop: `1px solid ${BORDER}` }}>
            <PrivacyPolicyMetadata policy={policy} placement="footer" />
          </footer>
        </div>
      </div>
    </PrivacyShell>
  );
}
