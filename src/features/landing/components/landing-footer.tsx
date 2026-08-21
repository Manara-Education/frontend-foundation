import { LandingWordmark } from "./landing-primitives";
import { FONT, TEXT } from "./theme";

export function LandingFooter() {
  return (
    <footer dir="rtl" style={{ background: TEXT, padding: "64px 28px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 48, display: "flex", alignItems: "flex-start", gap: 16 }}>
          <LandingWordmark size={32} light />
          <p style={{ fontFamily: FONT, fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, margin: 0, maxWidth: 320 }}>
            منصة تعلّم منظّمة مبنية لمساعدة المتعلمين على التقدم بوضوح.
          </p>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© {new Date().getFullYear()} Manara. جميع الحقوق محفوظة.</span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>منصة في مرحلة التطوير المبكر</span>
        </div>
      </div>
    </footer>
  );
}
