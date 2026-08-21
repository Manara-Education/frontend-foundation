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
    <section id="features" dir="rtl" style={{ padding: "100px 28px", background: BG_SOFT }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn><SectionHeading tag="لماذا منارة" title="مبنيّة للتعلّم المنظّم" subtitle="أربعة مبادئ أساسية تُشكّل تجربة التعلّم في منارة." /></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginTop: 56 }}>
          {items.map(({ icon, title, desc }, i) => (
            <FadeIn key={title} delay={i * 0.1}>
              <div style={{ padding: "32px 28px", borderRadius: 22, background: "#fff", border: `1px solid ${BORDER}`, boxShadow: "0 2px 16px rgba(78,91,146,0.05)" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${PRIMARY}12`, color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>{icon}</div>
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
