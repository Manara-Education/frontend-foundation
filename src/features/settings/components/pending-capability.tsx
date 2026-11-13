import type { ElementType } from "react";
import { FAINT, FONT, INK, PRIMARY, SURFACE_TINT, cardStyle } from "./settings-tokens";

interface PendingCapabilityProps {
  icon: ElementType;
  title: string;
  body: string;
}

/**
 * An honest placeholder for a section whose backend does not exist yet: it says so, and shows no
 * totals, cards, invoices or actions that would suggest otherwise.
 */
export function PendingCapability({ icon: Icon, title, body }: PendingCapabilityProps) {
  return (
    <section className="flex flex-col items-center text-center gap-3 px-6 py-12" style={{ ...cardStyle, fontFamily: FONT }}>
      <span className="flex items-center justify-center rounded-2xl" style={{ width: 56, height: 56, background: SURFACE_TINT, color: PRIMARY }}>
        <Icon size={24} aria-hidden />
      </span>
      <h2 style={{ fontWeight: 700, fontSize: 17, color: INK }}>{title}</h2>
      <p style={{ fontSize: 13.5, color: FAINT, maxWidth: 420, lineHeight: 1.8 }}>{body}</p>
      <span className="rounded-full px-3 py-1" style={{ fontSize: 11.5, fontWeight: 700, color: PRIMARY, background: SURFACE_TINT }}>
        قريبًا
      </span>
    </section>
  );
}
