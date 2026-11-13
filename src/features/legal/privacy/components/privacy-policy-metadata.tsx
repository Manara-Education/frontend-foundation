import { FONT, PRIMARY, TEXT_MUTED } from "@/features/landing/components/theme";
import type { PrivacyPolicy } from "../types/privacy-policy.types";

/** Version and effective date of the text being read, both as the server sent them. */
export function PrivacyPolicyMetadata({ policy, placement = "header" }: { policy: PrivacyPolicy; placement?: "header" | "footer" }) {
  const isFooter = placement === "footer";
  const termStyle = { fontWeight: 600, color: isFooter ? TEXT_MUTED : PRIMARY } as const;

  return (
    <dl
      className="rs-longform"
      style={{ display: "flex", flexWrap: "wrap", gap: isFooter ? "8px 24px" : "10px 28px", margin: 0, fontFamily: FONT, fontSize: isFooter ? 13 : 14, color: TEXT_MUTED, lineHeight: 1.9 }}
    >
      <div style={{ display: "flex", gap: 6, minInlineSize: 0 }}>
        <dt style={termStyle}>نسخة السياسة:</dt>
        <dd style={{ margin: 0 }}>{policy.version}</dd>
      </div>
      <div style={{ display: "flex", gap: 6, minInlineSize: 0 }}>
        <dt style={termStyle}>تاريخ السريان:</dt>
        <dd style={{ margin: 0 }}>
          <time dateTime={policy.effectiveDate}>{policy.effectiveDateLabel}</time>
        </dd>
      </div>
      <div style={{ display: "flex", gap: 6, minInlineSize: 0 }}>
        <dt style={termStyle}>الجهة المسؤولة:</dt>
        <dd style={{ margin: 0 }} dir="auto">{policy.operatorName}</dd>
      </div>
    </dl>
  );
}
