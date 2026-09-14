import type { CSSProperties } from "react";
import { Link } from "react-router";
import { Mail, Phone } from "lucide-react";
import {
  approvedContactChannels,
  PUBLIC_BUSINESS_FACTS,
  type ContactChannel,
  type PublicBusinessFacts,
} from "@/shared/business";
import { LandingWordmark } from "./landing-primitives";
import { FONT, TEXT } from "./theme";

/*
  Every link here is a static destination from the shared public facts; nothing is built
  from user input and no label is rendered as HTML. Links are at least 44px tall so they are
  comfortable touch targets, and carry a visible focus ring on the dark background.
*/
const LINK_CLASS = "focus-visible:outline-2 focus-visible:outline-offset-2";

const LINK_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  minBlockSize: 44,
  paddingInline: 4,
  borderRadius: 8,
  fontFamily: FONT,
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(255,255,255,0.78)",
  textDecoration: "none",
  outlineColor: "#FFFFFF",
};

const CHANNEL_ICONS: Record<ContactChannel["kind"], typeof Mail> = { email: Mail, phone: Phone };

interface LandingFooterProps {
  /** The published facts. Always the shared module in the app; tests pass approved fixtures. */
  facts?: PublicBusinessFacts;
}

export function LandingFooter({ facts = PUBLIC_BUSINESS_FACTS }: LandingFooterProps) {
  const channels = approvedContactChannels(facts);

  return (
    <footer dir="rtl" style={{ background: TEXT, paddingBlock: "64px 32px", paddingInline: "clamp(16px, 4vw, 28px)" }}>
      <div style={{ maxInlineSize: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 40, display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <LandingWordmark size={32} light />
          <p className="rs-longform" style={{ fontFamily: FONT, fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, margin: 0, maxInlineSize: 320, minInlineSize: 0 }}>
            منصة تعلّم منظّمة مبنية لمساعدة المتعلمين على التقدم بوضوح.
          </p>
        </div>

        {/*
          The legal and support destinations a visitor — or a payment provider reviewing the
          site — looks for first. A contact channel appears only once its fact is approved: an
          invented address in a footer is worse than none, because a refund request sent to it
          would never be answered.
        */}
        <nav aria-label="الشروط والدعم" style={{ marginBottom: 24 }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 20, rowGap: 0 }}>
            <li>
              <Link to={facts.legalLinks.terms} className={LINK_CLASS} style={LINK_STYLE}>
                الشروط والأحكام
              </Link>
            </li>
            <li>
              <Link to={facts.legalLinks.refundPolicy} className={LINK_CLASS} style={LINK_STYLE}>
                سياسة الإلغاء والاسترداد
              </Link>
            </li>
            {channels.map((channel) => {
              const Icon = CHANNEL_ICONS[channel.kind];
              return (
                <li key={channel.href}>
                  <a href={channel.href} className={LINK_CLASS} style={LINK_STYLE} aria-label={`${channel.label}: ${channel.display}`}>
                    <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                    {/* Addresses and numbers read left to right inside Arabic text. */}
                    <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{channel.display}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>© {new Date().getFullYear()} {facts.brand.latin}. جميع الحقوق محفوظة.</span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>منصة في مرحلة التطوير المبكر</span>
        </div>
      </div>
    </footer>
  );
}
