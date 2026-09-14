import { FONT, PRIMARY, TEXT_MUTED } from "@/features/landing/components/theme";
import { describeOffer, type OfferTone } from "../formatters/public-offer.formatter";
import type { PublicOffer } from "../types/public-courses.types";

const TONES: Record<OfferTone, { color: string; background: string; border: string }> = {
  free: { color: "#15803D", background: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.24)" },
  paid: { color: PRIMARY, background: "rgba(78,91,146,0.10)", border: "rgba(78,91,146,0.22)" },
  unavailable: { color: "#8A5A00", background: "rgba(245,166,35,0.12)", border: "rgba(245,166,35,0.30)" },
};

interface OfferBadgeProps {
  offer: PublicOffer;
  /** `md` for a card, `lg` for the course page's price panel. */
  size?: "md" | "lg";
}

/**
 * A course's price as a badge and a caption, the same on every public surface.
 *
 * The visible text abbreviates the currency; a visually hidden sentence says the whole offer
 * for screen readers, and the visible pieces are hidden from them so it is not read twice.
 */
export function OfferBadge({ offer, size = "md" }: OfferBadgeProps) {
  const { badge, caption, spoken, tone } = describeOffer(offer);
  const palette = TONES[tone];
  const large = size === "lg";

  return (
    <div data-offer-tone={tone} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, minInlineSize: 0 }}>
      <span className="sr-only">{spoken}</span>
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          maxInlineSize: "100%",
          fontFamily: FONT,
          fontSize: large ? 22 : 12,
          fontWeight: 700,
          lineHeight: 1.5,
          color: palette.color,
          background: palette.background,
          border: `1px solid ${palette.border}`,
          borderRadius: 99,
          padding: large ? "6px 16px" : "3px 10px",
          whiteSpace: "nowrap",
        }}
      >
        {badge}
      </span>
      {caption && (
        <span aria-hidden="true" style={{ fontFamily: FONT, fontSize: large ? 13 : 11.5, color: TEXT_MUTED }}>
          {caption}
        </span>
      )}
    </div>
  );
}
