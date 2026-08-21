import { BookOpen, Zap, Sparkles, ArrowLeft, Play } from "lucide-react";
import { FadeIn } from "./landing-primitives";
import { ChallengeCourseCard } from "./challenge-course-card";
import { PRIMARY, FONT, BG, BG_SOFT, TEXT, TEXT_MUTED, BORDER } from "./theme";

/** Section 1 — hero. */
export function HeroSection({ onCta }: { onCta: () => void }) {
  return (
    <section id="hero" dir="rtl" style={{ paddingTop: 120, paddingBottom: 80, background: `linear-gradient(180deg, ${BG_SOFT} 0%, ${BG} 100%)` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", display: "grid", gap: 60, alignItems: "center", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <FadeIn>
          <div>
            <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(30px, 4.5vw, 52px)", color: TEXT, margin: "0 0 24px", lineHeight: 1.25 }}>
              تعلّم بوضوح.<br /><span style={{ color: PRIMARY }}>تقدّم بثقة.</span>
            </h1>
            <p style={{ fontFamily: FONT, fontSize: 17, color: TEXT_MUTED, lineHeight: 1.85, margin: "0 0 36px", maxWidth: 480 }}>
              منارة تبني رحلة تعلّم منظمة تجمع بين الدورات الاحترافية، والدروس التفاعلية، وتتبع التقدم، والمساعدة الذكية في التعلم
            </p>
            <div id="hero-cta" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <button onClick={onCta} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 52, paddingLeft: 28, paddingRight: 28, borderRadius: 14, background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`, color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(78,91,146,0.3)" }}>
                انضم للوصول المبكر <ArrowLeft size={16} />
              </button>
              <button onClick={() => document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 52, paddingLeft: 24, paddingRight: 24, borderRadius: 14, background: "transparent", color: PRIMARY, border: `1.5px solid ${BORDER}`, fontFamily: FONT, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                <Play size={14} /> اكتشف منارة
              </button>
            </div>
            <div style={{ marginTop: 32, display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[{ icon: <BookOpen size={14} />, text: "دورات منظّمة" }, { icon: <Zap size={14} />, text: "اختبارات تفاعلية" }, { icon: <Sparkles size={14} />, text: "مساعدة بالذكاء الاصطناعي" }].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: FONT, fontSize: 13, color: TEXT_MUTED }}>
                  <div style={{ color: PRIMARY }}>{icon}</div>{text}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}><ChallengeCourseCard /></FadeIn>
      </div>
    </section>
  );
}
