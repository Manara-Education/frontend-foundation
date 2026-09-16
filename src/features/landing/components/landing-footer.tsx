import type { CSSProperties } from "react";
import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowUp, Mail, Phone } from "lucide-react";
import {
  approvedContactChannels,
  PUBLIC_BUSINESS_FACTS,
  type ContactChannel,
  type PublicBusinessFacts,
} from "@/shared/business";
import { paths } from "@/shared/navigation/paths";
import { LandingWordmark } from "./landing-primitives";
import { FONT, TEXT } from "./theme";

/*
  Every link here is a static destination from the shared public facts or the route table;
  nothing is built from user input and no label is rendered as HTML. Links are at least 44px
  tall so they are comfortable touch targets, and carry a visible focus ring on the dark
  background.
*/
const LINK_CLASS = "focus-visible:outline-2 focus-visible:outline-offset-2";

const NAV_LINK_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minBlockSize: 44,
  paddingInline: 6,
  marginInline: -6,
  borderRadius: 8,
  fontFamily: FONT,
  fontSize: 13.5,
  fontWeight: 600,
  color: "#D7DAEA",
  textDecoration: "none",
};

const CHANNEL_ICONS: Record<ContactChannel["kind"], typeof Mail> = { email: Mail, phone: Phone };

function ColumnHeading({ children }: { children: string }) {
  return (
    <>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", margin: "0 0 8px", lineHeight: 1.6, fontFamily: FONT }}>{children}</h2>
      <div style={{ inlineSize: 22, blockSize: 2, borderRadius: 99, background: "#6172AC", marginBlockEnd: 12 }} />
    </>
  );
}

interface LandingFooterProps {
  /** The published facts. Always the shared module in the app; tests pass approved fixtures. */
  facts?: PublicBusinessFacts;
}

export function LandingFooter({ facts = PUBLIC_BUSINESS_FACTS }: LandingFooterProps) {
  const channels = approvedContactChannels(facts);
  const [year] = useState(() => new Date().getFullYear());

  const backToTop = () => {
    const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <footer dir="rtl" style={{ background: TEXT, paddingBlock: "72px 28px", paddingInline: "clamp(16px, 4vw, 28px)", fontFamily: FONT }}>
      <div style={{ maxInlineSize: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "40px 32px" }}>
          <div style={{ flex: "1 1 280px", minInlineSize: 0 }}>
            <LandingWordmark size={32} light />
            <p className="rs-longform" style={{ fontFamily: FONT, fontSize: 13.5, color: "#9BA3C4", lineHeight: 1.95, margin: "18px 0 0", maxInlineSize: 310, minInlineSize: 0 }}>
              {facts.brand.arabic}، منصة تعلّم تساعدك على اكتشاف الدورات وتنظيم رحلتك التعليمية والتقدّم بوضوح.
            </p>
            <Link
              to={paths.about}
              className={LINK_CLASS}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, minBlockSize: 44, marginBlockStart: 6, paddingInline: 6, marginInline: -6, borderRadius: 8, fontSize: 13.5, fontWeight: 600, color: "#D7DAEA", textDecoration: "none" }}
            >
              عن {facts.brand.arabic}
              <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>

          <nav aria-label={`اكتشف ${facts.brand.arabic}`} style={{ flex: "1 1 200px", minInlineSize: 0 }}>
            <ColumnHeading>{`اكتشف ${facts.brand.arabic}`}</ColumnHeading>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <li><Link to={paths.landing} className={LINK_CLASS} style={NAV_LINK_STYLE}>الرئيسية</Link></li>
              <li><Link to={paths.courses} className={LINK_CLASS} style={NAV_LINK_STYLE}>الدورات المتاحة</Link></li>
              <li><Link to={paths.about} className={LINK_CLASS} style={NAV_LINK_STYLE}>عن {facts.brand.arabic}</Link></li>
              <li><Link to={paths.contact} className={LINK_CLASS} style={NAV_LINK_STYLE}>تواصل معنا</Link></li>
            </ul>
          </nav>

          <nav aria-label="السياسات والشروط" style={{ flex: "1 1 200px", minInlineSize: 0 }}>
            <ColumnHeading>السياسات والشروط</ColumnHeading>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <li><Link to={paths.privacy} className={LINK_CLASS} style={NAV_LINK_STYLE}>سياسة الخصوصية</Link></li>
              <li><Link to={paths.security} className={LINK_CLASS} style={NAV_LINK_STYLE}>سياسة الأمان</Link></li>
              <li><Link to={facts.legalLinks.terms} className={LINK_CLASS} style={NAV_LINK_STYLE}>الشروط والأحكام</Link></li>
              <li><Link to={facts.legalLinks.refundPolicy} className={LINK_CLASS} style={NAV_LINK_STYLE}>سياسة الإلغاء والاسترداد</Link></li>
            </ul>
          </nav>

          <div style={{ flex: "1 1 200px", minInlineSize: 0 }}>
            <ColumnHeading>تواصل معنا</ColumnHeading>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              {channels.length === 0 && (
                <li style={{ fontFamily: FONT, fontSize: 13, color: "#9BA3C4", lineHeight: 1.8, paddingBlock: "8px 4px", maxInlineSize: 220 }}>
                  قنوات الدعم المباشرة قيد الإعداد — راسلنا عبر النموذج أدناه.
                </li>
              )}
              {channels.map((channel) => {
                const Icon = CHANNEL_ICONS[channel.kind];
                return (
                  <li key={channel.href}>
                    <a
                      href={channel.href}
                      className={LINK_CLASS}
                      aria-label={`${channel.label}: ${channel.display}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, minBlockSize: 44, paddingInline: 6, marginInline: -6, borderRadius: 8, fontSize: 13.5, fontWeight: 600, color: "#D7DAEA", textDecoration: "none", overflowWrap: "anywhere" }}
                    >
                      <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                      <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{channel.display}</span>
                    </a>
                  </li>
                );
              })}
              <li>
                <Link
                  to={paths.contact}
                  className={LINK_CLASS}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, minBlockSize: 44, marginBlockStart: 8, paddingInline: 14, borderRadius: 10, border: "1px solid rgba(255,255,255,0.22)", fontSize: 13, fontWeight: 700, color: "#FFFFFF", textDecoration: "none" }}
                >
                  صفحة التواصل
                  <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ marginBlockStart: 48, paddingBlockStart: 22, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px 16px" }}>
          <span style={{ fontFamily: FONT, fontSize: 12.5, color: "#9BA3C4", lineHeight: 1.8 }}>
            © {year} {facts.brand.latin}. جميع الحقوق محفوظة. — منصة في مرحلة التطوير المبكر
          </span>
          <button
            type="button"
            onClick={backToTop}
            className={LINK_CLASS}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, minBlockSize: 44, paddingInline: 12, borderRadius: 10, border: "none", background: "transparent", fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: "#D7DAEA", cursor: "pointer" }}
          >
            <ArrowUp size={14} strokeWidth={2} aria-hidden="true" />
            العودة إلى الأعلى
          </button>
        </div>
      </div>
    </footer>
  );
}
