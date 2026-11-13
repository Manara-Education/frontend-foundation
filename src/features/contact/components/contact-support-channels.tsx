import { Mail, Phone } from "lucide-react";
import { Link } from "react-router";
import {
  approvedContactChannels,
  PUBLIC_BUSINESS_FACTS,
  type ContactChannel,
  type PublicBusinessFacts,
} from "@/shared/business";
import { paths } from "@/shared/navigation/paths";
import { BORDER, FONT, PRIMARY, TEXT, TEXT_LIGHT, TEXT_MUTED } from "@/features/landing/components/theme";

const CHANNEL_ICONS: Record<ContactChannel["kind"], typeof Mail> = { email: Mail, phone: Phone };

interface ContactSupportChannelsProps {
  /** The published facts. Always the shared module in the app; tests pass approved fixtures. */
  facts?: PublicBusinessFacts;
}

/**
 * "قنوات الدعم" — approved channels only, exactly like the footer. supportEmail and
 * supportPhone are still `status: "pending"` in `public-business-facts.ts`, so today this
 * renders zero channels and the honest fallback below rather than the unapproved address the
 * design mockup hardcoded.
 */
export function ContactSupportChannels({ facts = PUBLIC_BUSINESS_FACTS }: ContactSupportChannelsProps) {
  const channels = approvedContactChannels(facts);

  return (
    <section
      aria-labelledby="channels-heading"
      style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 22, padding: "clamp(22px, 4vw, 30px)" }}
    >
      <h2 id="channels-heading" style={{ fontWeight: 700, fontSize: 18, color: TEXT, lineHeight: 1.6, margin: "0 0 18px", fontFamily: FONT }}>
        قنوات الدعم
      </h2>

      {channels.length === 0 ? (
        <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.9, margin: 0, fontFamily: FONT }}>
          قنوات الدعم المباشرة قيد الإعداد. النموذج المجاور هو أفضل طريقة للتواصل معنا الآن — نراجع كل رسالة ونردّ على بريدك الإلكتروني.
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {channels.map((channel) => {
            const Icon = CHANNEL_ICONS[channel.kind];
            return (
              <li key={channel.href}>
                <a
                  href={channel.href}
                  aria-label={`${channel.label}: ${channel.display}`}
                  className="focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ display: "flex", alignItems: "center", gap: 12, minBlockSize: 52, paddingInline: 12, marginInline: -12, borderRadius: 12, textDecoration: "none", minInlineSize: 0, outlineColor: PRIMARY }}
                >
                  <span style={{ inlineSize: 40, blockSize: 40, borderRadius: 12, background: "rgba(78,91,146,0.08)", color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span style={{ minInlineSize: 0 }}>
                    <span style={{ display: "block", fontSize: 12.5, color: TEXT_LIGHT, lineHeight: 1.6, fontFamily: FONT }}>{channel.label}</span>
                    <span dir="ltr" style={{ display: "block", unicodeBidi: "isolate", fontSize: 14, fontWeight: 600, color: TEXT, overflowWrap: "anywhere", fontFamily: FONT }}>
                      {channel.display}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      <p style={{ fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.9, margin: "20px 0 0", paddingBlockStart: 18, borderBlockStart: `1px solid ${BORDER}`, overflowWrap: "anywhere", fontFamily: FONT }}>
        للاستفسارات المتعلقة بالمدفوعات، راجع{" "}
        <Link to={facts.legalLinks.refundPolicy} replace style={{ color: PRIMARY, fontWeight: 600, textDecoration: "none", borderBlockEnd: "1px solid rgba(78,91,146,0.35)" }}>
          سياسة الإلغاء والاسترداد
        </Link>{" "}
        قبل إرسال الرسالة.
      </p>
    </section>
  );
}
