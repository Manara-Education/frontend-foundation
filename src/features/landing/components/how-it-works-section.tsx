import { FadeIn, SectionHeading } from "./landing-primitives";
import { PRIMARY, FONT, BG, TEXT, TEXT_MUTED } from "./theme";

/** Section 5 — how it works. */
export function HowItWorksSection() {
  const steps = [
    { n: "٠١", title: "اختر دورة",         desc: "ابحث عن دورة تناسب أهدافك التعليمية وابدأ مسيرتك." },
    { n: "٠٢", title: "تعلّم خطوة بخطوة", desc: "اتّبع دروسًا منظّمة بتسلسل واضح ومدروس." },
    { n: "٠٣", title: "اختبر فهمك",        desc: "احضر اللقاءات في كل درس وتحقق من استيعابك." },
    { n: "٠٤", title: "استمر في التقدم",   desc: "تابع تقدّمك وافتح المرحلة التالية في رحلتك التعليمية." },
  ];
  return (
    <section id="how-it-works" dir="rtl" style={{ paddingBlock: "clamp(72px, 10vw, 100px)", paddingInline: "clamp(16px, 4vw, 28px)", background: BG }}>
      <div style={{ maxInlineSize: 1100, margin: "0 auto" }}>
        <FadeIn><SectionHeading tag="كيف يعمل" title="رحلة تعلّم متكاملة" subtitle="أربع خطوات واضحة تأخذك من الاكتشاف إلى الإتقان." center /></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 0, marginTop: 60 }}>
          {steps.map(({ n, title, desc }, i) => (
            <FadeIn key={n} delay={i * 0.1}>
              <div className="rs-longform" style={{ paddingBlock: 32, paddingInline: "clamp(18px, 6vw, 24px)", textAlign: "center" }}>
                <div style={{ inlineSize: 64, blockSize: 64, borderRadius: 20, background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontFamily: FONT, fontWeight: 800, fontSize: 18, boxShadow: "0 6px 20px rgba(78,91,146,0.28)" }}>
                  {n}
                </div>
                <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 17, color: TEXT, margin: "0 0 10px" }}>{title}</h3>
                <p style={{ fontFamily: FONT, fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.8, margin: 0 }}>{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
