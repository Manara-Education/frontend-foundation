import { ArrowLeft } from "lucide-react";
import { FadeIn } from "./landing-primitives";
import { PRIMARY, PRIMARY_DARK, FONT } from "./theme";

/** Section 2 — early access. */
export function EarlyAccessSection({ onCta }: { onCta: () => void }) {
  return (
    <section dir="rtl" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`, padding: "56px 28px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(22px, 3.5vw, 34px)", color: "#fff", margin: "0 0 16px" }}>كن جزءًا من منارة من البداية</h2>
          <p style={{ fontFamily: FONT, fontSize: 15.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, margin: "0 0 32px" }}>
            نبني منارة لجعل التعلّم الإلكتروني أكثر تنظيمًا وتركيزًا وفعالية. انضم إلينا وساهم في تشكيل هذه التجربة.
          </p>
          <button onClick={onCta} style={{ height: 50, paddingLeft: 28, paddingRight: 28, borderRadius: 13, background: "#fff", color: PRIMARY, border: "none", cursor: "pointer", fontFamily: FONT, fontWeight: 700, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 8 }}>
            أنشئ حسابك <ArrowLeft size={15} />
          </button>
        </FadeIn>
      </div>
    </section>
  );
}
