import { Layers, BarChart2, Target, Lightbulb } from "lucide-react";
import { FadeIn, SectionHeading } from "./landing-primitives";
import { PRIMARY, FONT, BG, BG_SOFT, TEXT, TEXT_MUTED, BORDER } from "./theme";

/** Section 3 — the problem. */
export function ProblemSection() {
  const items = [
    { icon: <Layers size={22} strokeWidth={1.6} />, title: "محتوى كثير بلا اتجاه", desc: "الكثير من المحتوى المتاح دون خارطة طريق واضحة لما يجب تعلّمه أولاً." },
    { icon: <BarChart2 size={22} strokeWidth={1.6} />, title: "تقدم غير واضح", desc: "يصعب على المتعلمين معرفة أين وصلوا في مسيرتهم التعليمية." },
    { icon: <Target size={22} strokeWidth={1.6} />, title: "تعلّم سلبي", desc: "مشاهدة المحتوى وحدها لا تُثبّت الفهم أو تختبر مستوى الاستيعاب." },
    { icon: <Lightbulb size={22} strokeWidth={1.6} />, title: "التوقف عند الصعوبات", desc: "المتعلمون يحتاجون أحيانًا إلى تلميح صغير لا إلى الإجابة الكاملة." },
  ];
  return (
    <section dir="rtl" style={{ paddingBlock: "clamp(72px, 10vw, 100px)", paddingInline: "clamp(16px, 4vw, 28px)", background: BG }}>
      <div style={{ maxInlineSize: 1100, margin: "0 auto" }}>
        <FadeIn><SectionHeading tag="المشكلة" title="التعلّم لا يجب أن يكون فوضويًا" subtitle="كثير من منصات التعلّم توفّر المحتوى لكنها لا تُنظّم الرحلة." center /></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 20, marginTop: 56 }}>
          {items.map(({ icon, title, desc }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <div className="rs-longform" style={{ paddingBlock: 28, paddingInline: "clamp(20px, 6vw, 24px)", borderRadius: 20, border: `1px solid ${BORDER}`, background: BG_SOFT }}>
                <div style={{ inlineSize: 48, blockSize: 48, borderRadius: 14, background: `${PRIMARY}10`, color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>{icon}</div>
                <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: TEXT, margin: "0 0 10px" }}>{title}</h3>
                <p style={{ fontFamily: FONT, fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.75, margin: 0 }}>{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
