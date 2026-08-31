import { useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { ManaraLogoIcon } from "@/shared/components/ManaraLogo";
import { PRIMARY, FONT, TEXT, TEXT_MUTED, TEXT_LIGHT } from "./theme";

/**
 * The landing wordmark is its own lock-up (uppercase "MANARA" caption, tighter
 * gap, light-on-dark variant for the footer) and does not match the app-shell
 * `ManaraLogoFull`, so it stays local to this feature. The glyph itself is the
 * shared `ManaraLogoIcon`.
 */
export function LandingWordmark({ size = 32, light = false }: { size?: number; light?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <ManaraLogoIcon size={size} color={light ? "rgba(255,255,255,0.85)" : PRIMARY} />
      <div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: size * 0.56, color: light ? "#fff" : TEXT, lineHeight: 1 }}>منارة</div>
        <div style={{ fontFamily: FONT, fontSize: size * 0.25, color: light ? "rgba(255,255,255,0.55)" : TEXT_LIGHT, letterSpacing: 2, lineHeight: 1.2 }}>MANARA</div>
      </div>
    </div>
  );
}

export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export function Tag({ children, color = PRIMARY }: { children: ReactNode; color?: string }) {
  return (
    <span className="rs-longform" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color, background: `${color}12`, border: `1px solid ${color}22`, borderRadius: 99, padding: "4px 14px", display: "inline-block", maxInlineSize: "100%" }}>
      {children}
    </span>
  );
}

export function SectionHeading({ tag, title, subtitle, center = false }: { tag?: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className="rs-longform" style={{ textAlign: center ? "center" : "right", maxInlineSize: center ? 640 : undefined, margin: center ? "0 auto" : undefined }}>
      {tag && <div style={{ marginBottom: 14 }}><Tag>{tag}</Tag></div>}
      <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(26px, 4vw, 40px)", color: TEXT, margin: "0 0 16px", lineHeight: 1.3 }}>{title}</h2>
      {subtitle && <p style={{ fontFamily: FONT, fontSize: 16, color: TEXT_MUTED, lineHeight: 1.8, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}
