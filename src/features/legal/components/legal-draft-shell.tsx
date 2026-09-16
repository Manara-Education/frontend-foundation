import type { ReactNode } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { PublicHeader } from "@/features/landing/components/public-header";
import { PublicBreadcrumb } from "@/features/landing/components/public-breadcrumb";
import { BORDER, FONT, PRIMARY, TEXT, TEXT_MUTED } from "@/features/landing/components/theme";
import { useHashScroll } from "@/shared/navigation";

export interface LegalDraftTocItem {
  id: string;
  number: number;
  title: string;
}

interface LegalDraftShellProps {
  title: string;
  intro: string;
  tocLabel: string;
  toc: LegalDraftTocItem[];
  children: ReactNode;
}

/**
 * The shell Privacy and Security share: a "draft, not yet approved" badge (this task's own
 * content rule — neither page's text is evidence of legal approval), a sticky table of
 * contents, and the same public header/footer every secondary page uses.
 *
 * Unlike the published Terms, there is no version registry behind these — the badge, the
 * "status: draft" line and each section's own "ما زال قيد التحديد" notes are the whole
 * approval story, written directly into the page rather than fetched.
 */
export function LegalDraftShell({ title, intro, tocLabel, toc, children }: LegalDraftShellProps) {
  useHashScroll();

  return (
    <div dir="rtl" style={{ background: "#F8F9FD", minHeight: "100dvh", fontFamily: FONT, display: "flex", flexDirection: "column" }}>
      <PublicHeader />

      <main style={{ flex: "1 1 auto", inlineSize: "100%", maxInlineSize: 1100, margin: "0 auto", padding: "clamp(20px, 4vw, 36px) clamp(16px, 4vw, 40px) clamp(56px, 8vw, 84px)" }}>
        <PublicBreadcrumb current={title} />

        <header style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 24, padding: "clamp(24px, 4vw, 36px)", marginBlockEnd: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, alignSelf: "flex-start", fontSize: 12, fontWeight: 700, color: "#B47008", background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 99, padding: "5px 14px" }}>
            <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" />
            مسودة — قيد المراجعة، وليست نسخة معتمدة
          </span>
          <h1 style={{ fontWeight: 800, fontSize: "clamp(24px, 4vw, 34px)", color: TEXT, lineHeight: 1.4, margin: 0, overflowWrap: "anywhere" }}>{title}</h1>
          <p className="rs-longform" style={{ fontSize: 16, color: TEXT, lineHeight: 2, margin: 0, maxInlineSize: 780, overflowWrap: "anywhere" }}>{intro}</p>
          <dl style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px", margin: 0, fontSize: 14, color: TEXT_MUTED, lineHeight: 1.9 }}>
            <div style={{ display: "flex", gap: 6, minInlineSize: 0 }}>
              <dt style={{ fontWeight: 600, color: PRIMARY }}>الحالة:</dt>
              <dd style={{ margin: 0 }}>مسودة للمراجعة</dd>
            </div>
            <div style={{ display: "flex", gap: 6, minInlineSize: 0 }}>
              <dt style={{ fontWeight: 600, color: PRIMARY }}>تاريخ السريان:</dt>
              <dd style={{ margin: 0 }}>لم يُحدَّد بعد</dd>
            </div>
          </dl>
        </header>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
          <aside style={{ flex: "1 1 260px", maxInlineSize: 292, minInlineSize: 0, position: "sticky", insetBlockStart: 16 }}>
            <details open style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "16px 18px" }}>
              <summary style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minBlockSize: 36, fontWeight: 700, fontSize: 15, color: TEXT, cursor: "pointer", listStyle: "none" }}>
                محتويات الوثيقة
                <ChevronDown size={16} strokeWidth={2} color="#9BA3C4" aria-hidden="true" />
              </summary>
              <nav aria-label={tocLabel} style={{ marginBlockStart: 10 }}>
                <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{ display: "flex", alignItems: "center", minBlockSize: 44, fontSize: 14, lineHeight: 1.7, color: TEXT_MUTED, textDecoration: "none", borderRadius: 10, paddingInline: 10, outlineColor: PRIMARY }}
                      >
                        <span style={{ color: PRIMARY, fontWeight: 700, marginInlineEnd: 6 }}>{item.number}.</span>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </details>
          </aside>

          <div style={{ flex: "3 1 520px", minInlineSize: 0, maxInlineSize: 780, background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 24, padding: "clamp(24px, 4vw, 44px)" }}>
            <article style={{ display: "flex", flexDirection: "column", gap: 36 }}>{children}</article>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} style={{ display: "flex", flexDirection: "column", gap: 14, scrollMarginBlockStart: 24 }}>
      <h2 style={{ fontWeight: 700, fontSize: "clamp(18px, 2.4vw, 21px)", color: TEXT, lineHeight: 1.6, margin: 0, overflowWrap: "anywhere" }}>{title}</h2>
      {children}
    </section>
  );
}

export function LegalParagraph({ children }: { children: ReactNode }) {
  return (
    <p className="rs-longform" style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 2, margin: 0, overflowWrap: "anywhere" }}>
      {children}
    </p>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul style={{ margin: 0, paddingInlineStart: 22, display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, index) => (
        <li key={index} style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 2, overflowWrap: "anywhere" }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** The "still being determined" note every section with a known gap ends on. */
export function LegalGapNote({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 15, color: "#9BA3C4", lineHeight: 1.95, margin: 0, padding: "14px 16px", borderRadius: 12, background: "#F8F9FD", border: `1px solid ${BORDER}`, overflowWrap: "anywhere" }}>
      {children}
    </p>
  );
}

export function LegalGapsSection({ heading, items }: { heading: string; items: ReactNode[] }) {
  return (
    <section aria-labelledby="gaps-heading" style={{ marginBlockStart: 8, paddingBlockStart: 28, borderBlockStart: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 id="gaps-heading" style={{ fontWeight: 700, fontSize: 16, color: TEXT, lineHeight: 1.6, margin: 0 }}>{heading}</h2>
      <ul style={{ margin: 0, paddingInlineStart: 22, display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, index) => (
          <li key={index} style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.95, overflowWrap: "anywhere" }}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
