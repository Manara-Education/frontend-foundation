import { FONT, PRIMARY, TEXT_MUTED } from "@/features/landing/components/theme";
import type { CurrentTerms } from "../types/terms.types";

interface TermsMetadataProps {
  current: CurrentTerms;
  /** `header` sits above the document, `footer` closes it. Only the styling differs. */
  placement?: "header" | "footer";
}

/**
 * The version and effective date of the text being read.
 *
 * Deliberately rendered *outside* the `<article>` that holds the clauses. These are facts
 * about the document, not terms of it, and interleaving them with the numbered sections
 * would make the agreed text ambiguous — which clause is 4, the one about payment or the
 * version banner above it?
 *
 * The date is marked up as a `<time>` carrying the server's ISO value, so the machine
 * -readable date is the source's rather than the Arabic rendering of it.
 */
export function TermsMetadata({ current, placement = "header" }: TermsMetadataProps) {
  const isFooter = placement === "footer";

  return (
    <dl
      className="rs-longform"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: isFooter ? "8px 24px" : "10px 28px",
        margin: 0,
        fontFamily: FONT,
        fontSize: isFooter ? 13 : 14,
        color: TEXT_MUTED,
        lineHeight: 1.9,
      }}
    >
      <div style={{ display: "flex", gap: 6, minInlineSize: 0 }}>
        <dt style={{ fontWeight: 600, color: isFooter ? TEXT_MUTED : PRIMARY }}>نسخة الشروط:</dt>
        <dd style={{ margin: 0 }}>{current.version}</dd>
      </div>
      <div style={{ display: "flex", gap: 6, minInlineSize: 0 }}>
        <dt style={{ fontWeight: 600, color: isFooter ? TEXT_MUTED : PRIMARY }}>تاريخ السريان:</dt>
        <dd style={{ margin: 0 }}>
          <time dateTime={current.effectiveDate}>{current.effectiveDateLabel}</time>
        </dd>
      </div>
    </dl>
  );
}
