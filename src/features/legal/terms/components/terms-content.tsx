import type { ReactNode } from "react";
import { Link } from "react-router";
import { AlertTriangle, RotateCw } from "lucide-react";
import { BORDER, FONT, PRIMARY, TEXT, TEXT_MUTED } from "@/features/landing/components/theme";
import { ManaraLogoFull } from "@/shared/components/ManaraLogo";
import { Spinner } from "@/shared/components";
import { paths } from "@/shared/navigation";
import type { TermsViewState } from "../types/terms.types";
import { TermsDocumentView } from "./terms-document";
import { TermsMetadata } from "./terms-metadata";
import { TermsSectionNav } from "./terms-section-nav";

interface TermsContentProps {
  state: TermsViewState;
  onRetry: () => void;
}

const TITLE_ID = "terms-title";

/** The page's own frame: RTL, the wordmark home, and whichever state is being shown. */
function TermsShell({ children }: { children: ReactNode }) {
  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100dvh",
        background: "#F6F7FC",
        backgroundImage: `radial-gradient(circle at 85% 6%, rgba(78,91,146,0.06) 0%, transparent 55%),
                          radial-gradient(circle at 10% 90%, rgba(78,91,146,0.05) 0%, transparent 50%)`,
        fontFamily: FONT,
      }}
    >
      <header
        className="flex items-center justify-between gap-4 flex-wrap"
        style={{
          padding: "20px clamp(16px, 4vw, 40px)",
          borderBottom: `1px solid ${BORDER}`,
          background: "rgba(255,255,255,0.7)",
        }}
      >
        <Link
          to={paths.landing}
          className="focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
          style={{ textDecoration: "none", outlineColor: PRIMARY }}
          aria-label="العودة إلى منارة"
        >
          <ManaraLogoFull size={30} color={PRIMARY} textColor={PRIMARY} />
        </Link>
        <Link
          to={paths.landing}
          className="rs-longform focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
          style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: PRIMARY, outlineColor: PRIMARY }}
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </header>

      <main
        style={{
          maxInlineSize: 1100,
          margin: "0 auto",
          padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 40px) 64px",
        }}
      >
        {children}
      </main>
    </div>
  );
}

/** A centred notice — used for both "we could not ask" and "we have no such text". */
function TermsNotice({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rs-longform"
      style={{
        background: "#FFFFFF",
        border: `1px solid ${BORDER}`,
        borderRadius: 24,
        padding: "clamp(28px, 5vw, 44px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 16,
        maxInlineSize: 640,
        margin: "0 auto",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          inlineSize: 48,
          blockSize: 48,
          borderRadius: 16,
          background: "rgba(245,166,35,0.12)",
          color: "#B47008",
        }}
      >
        <AlertTriangle size={22} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: TEXT, margin: 0 }}>
        {title}
      </h1>
      <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT_MUTED, lineHeight: 2, margin: 0 }}>
        {body}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 14,
          color: "#FFFFFF",
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #3A4370 100%)`,
          border: "none",
          borderRadius: 12,
          padding: "11px 20px",
          cursor: "pointer",
          outlineColor: PRIMARY,
        }}
      >
        <RotateCw size={15} strokeWidth={2} aria-hidden="true" />
        إعادة المحاولة
      </button>
    </div>
  );
}

/**
 * The public terms and conditions screen.
 *
 * Four states, and the interesting one is `unavailable`: the server named a version whose
 * text this build does not carry. The page says so plainly instead of rendering the newest
 * text it happens to have, because a superseded contract shown as the current one is a
 * worse outcome than an empty page.
 */
export function TermsContent({ state, onRetry }: TermsContentProps) {
  if (state.status === "loading") {
    return (
      <TermsShell>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: "80px 0",
          }}
        >
          <Spinner size="lg" />
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT_MUTED, margin: 0 }}>
            جارٍ تحميل الشروط والأحكام…
          </p>
        </div>
      </TermsShell>
    );
  }

  if (state.status === "error") {
    return (
      <TermsShell>
        <TermsNotice
          title="تعذّر تحميل الشروط والأحكام"
          body="لم نتمكن من معرفة النسخة الحالية من الشروط والأحكام. تحقق من اتصالك بالإنترنت ثم أعد المحاولة."
          onRetry={onRetry}
        />
      </TermsShell>
    );
  }

  if (state.status === "unavailable") {
    return (
      <TermsShell>
        <TermsNotice
          title="الشروط والأحكام غير متاحة للعرض"
          body={`النسخة الحالية من الشروط والأحكام (${state.current.version}) غير متوفرة في هذا الإصدار من الموقع، ولا نعرض نسخة أقدم بدلاً منها. يُرجى إعادة المحاولة بعد قليل.`}
          onRetry={onRetry}
        />
      </TermsShell>
    );
  }

  const { current, document } = state;

  return (
    <TermsShell>
      {/* Metadata about the document — never inside the agreement itself. */}
      <header
        style={{
          background: "#FFFFFF",
          border: `1px solid ${BORDER}`,
          borderRadius: 24,
          padding: "clamp(24px, 4vw, 36px)",
          marginBlockEnd: 28,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <h1
          id={TITLE_ID}
          className="rs-longform"
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: "clamp(24px, 4vw, 34px)",
            color: TEXT,
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {document.title}
        </h1>
        <TermsMetadata current={current} />
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="w-full lg:w-[292px] lg:shrink-0 lg:sticky lg:top-6">
          <TermsSectionNav sections={document.sections} />
        </aside>

        <div
          className="min-w-0 flex-1"
          style={{
            background: "#FFFFFF",
            border: `1px solid ${BORDER}`,
            borderRadius: 24,
            padding: "clamp(24px, 4vw, 44px)",
          }}
        >
          <TermsDocumentView document={document} titleId={TITLE_ID} />

          <footer
            style={{
              marginBlockStart: 40,
              paddingBlockStart: 20,
              borderTop: `1px solid ${BORDER}`,
            }}
          >
            <TermsMetadata current={current} placement="footer" />
          </footer>
        </div>
      </div>
    </TermsShell>
  );
}
