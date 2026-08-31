import { BookOpen, Zap, TrendingUp, Sparkles } from "lucide-react";
import { FadeIn, SectionHeading } from "./landing-primitives";
import { PRIMARY, FONT, BG_SOFT, TEXT, TEXT_MUTED, BORDER } from "./theme";

/** Section 4 — why Manara. */
export function FeaturesSection() {
  const items = [
    { icon: <BookOpen size={24} strokeWidth={1.6} />, title: "دورات منظّمة", desc: "الدورات مقسّمة إلى دروس ومراحل تعليمية واضحة تُرشدك خطوة بخطوة." },
    { icon: <Zap size={24} strokeWidth={1.6} />, title: "لقاءات تفاعلية", desc: "اثبت فهمك من خلال لقاءات في كل مرحلة من مراحل التعلم." },
    { icon: <TrendingUp size={24} strokeWidth={1.6} />, title: "تتبع التقدم", desc: "اعرف ما أنجزته وما تعمل عليه الآن وما ينتظرك في الخطوة القادمة." },
    { icon: <Sparkles size={24} strokeWidth={1.6} />, title: "مساعدة ذكية", desc: "تلميحات سياقية عند التوقف دون الكشف الفوري عن الإجابة." },
  ];
  return (
    <section id="features" dir="rtl" style={{ paddingBlock: "clamp(72px, 10vw, 100px)", paddingInline: "clamp(16px, 4vw, 28px)", background: BG_SOFT }}>
      <div style={{ maxInlineSize: 1100, margin: "0 auto" }}>
        <FadeIn><SectionHeading tag="لماذا منارة" title="مبنيّة للتعلّم المنظّم" subtitle="أربعة مبادئ أساسية تُشكّل تجربة التعلّم في منارة." /></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gap: 20, marginTop: 56 }}>
          {items.map(({ icon, title, desc }, i) => (
            <FadeIn key={title} delay={i * 0.1}>
              <div className="rs-longform" style={{ paddingBlock: 32, paddingInline: "clamp(22px, 6vw, 28px)", borderRadius: 22, background: "#fff", border: `1px solid ${BORDER}`, boxShadow: "0 2px 16px rgba(78,91,146,0.05)" }}>
                <div style={{ inlineSize: 56, blockSize: 56, borderRadius: 16, background: `${PRIMARY}12`, color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>{icon}</div>
                <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 17, color: TEXT, margin: "0 0 12px" }}>{title}</h3>
                <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT_MUTED, lineHeight: 1.8, margin: 0 }}>{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
