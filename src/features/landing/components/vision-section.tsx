import { Layers, Zap, Target, Sparkles, TrendingUp } from "lucide-react";
import { FadeIn, SectionHeading } from "./landing-primitives";
import { PRIMARY, FONT, BG_SOFT, TEXT, TEXT_MUTED, BORDER } from "./theme";

/** Section 12 — vision. */
export function VisionSection() {
  const principles = [
    { icon: <Layers size={20} strokeWidth={1.6} />,     title: "منظّم",           desc: "مسارات التعلّم يجب أن تكون واضحة ومقصودة." },
    { icon: <Zap size={20} strokeWidth={1.6} />,        title: "تفاعلي",          desc: "يجب على المتعلمين التحقق من فهمهم بصورة نشطة." },
    { icon: <Target size={20} strokeWidth={1.6} />,     title: "مركّز",           desc: "التجربة يجب أن تُزيل التشتت غير الضروري." },
    { icon: <Sparkles size={20} strokeWidth={1.6} />,   title: "مساند",           desc: "التقنية يجب أن تساعد المتعلم عند احتياجه للدعم." },
    { icon: <TrendingUp size={20} strokeWidth={1.6} />, title: "موجّه للتقدم",    desc: "كل متعلم يعرف أين هو وما يأتي بعده دائمًا." },
  ];
  return (
    <section id="vision" dir="rtl" style={{ paddingBlock: "clamp(72px, 10vw, 100px)", paddingInline: "clamp(16px, 4vw, 28px)", background: BG_SOFT }}>
      <div style={{ maxInlineSize: 1100, margin: "0 auto" }}>
        <FadeIn><SectionHeading tag="رؤيتنا" title="ما نبنيه" subtitle="خمسة مبادئ أساسية تُوجّه كل قرار نتخذه في تطوير منارة." center /></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(190px, 100%), 1fr))", gap: 16, marginTop: 56 }}>
          {principles.map(({ icon, title, desc }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <div className="rs-longform" style={{ paddingBlock: 28, paddingInline: "clamp(18px, 6vw, 22px)", borderRadius: 20, background: "#fff", border: `1px solid ${BORDER}`, textAlign: "center" }}>
                <div style={{ inlineSize: 50, blockSize: 50, borderRadius: 14, background: `${PRIMARY}10`, color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>{icon}</div>
                <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: TEXT, margin: "0 0 8px" }}>{title}</h3>
                <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT_MUTED, lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
