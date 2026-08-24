import { ArrowLeft, Circle, GraduationCap } from "lucide-react";
import { FadeIn } from "./landing-primitives";
import { PRIMARY, PRIMARY_DARK, FONT, BG } from "./theme";

/** Section 13 — closing call to action. */
export function CtaSection({ onCta }: { onCta: () => void }) {
  return (
    <section dir="rtl" style={{ padding: "100px 28px", background: BG }}>
      <FadeIn>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", padding: "60px 48px", borderRadius: 28, background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`, boxShadow: "0 20px 60px rgba(78,91,146,0.25)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 99, padding: "5px 16px", marginBottom: 24 }}>
            <Circle size={7} color="#4ade80" fill="#4ade80" />
            <span style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>الوصول المبكر مفتوح</span>
          </div>
          <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(24px, 4vw, 38px)", color: "#fff", margin: "0 0 18px", lineHeight: 1.3 }}>ابدأ رحلتك مع منارة</h2>
          <p style={{ fontFamily: FONT, fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.85, margin: "0 0 36px" }}>
            انضم إلى منارة وكن من أوائل من يختبرون طريقة أكثر تنظيمًا وفعالية للتعلّم.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onCta} style={{ height: 52, paddingLeft: 32, paddingRight: 32, borderRadius: 14, background: "#fff", color: PRIMARY, border: "none", cursor: "pointer", fontFamily: FONT, fontWeight: 700, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 8 }}>
              انضم للوصول المبكر <ArrowLeft size={16} />
            </button>
            <button onClick={onCta} style={{ height: 52, paddingLeft: 28, paddingRight: 28, borderRadius: 14, background: "transparent", color: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: FONT, fontWeight: 600, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <GraduationCap size={15} /> انضم كمدرّس
            </button>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
