import { FadeIn, SectionHeading } from "./landing-primitives";
import { ProgressMockup } from "./progress-mockup";
import { FONT, BG, BG_SOFT, TEXT, TEXT_MUTED, BORDER } from "./theme";

/** Section 9 — progress tracking. */
export function ProgressSection() {
  return (
    <section dir="rtl" style={{ paddingBlock: "clamp(72px, 10vw, 100px)", paddingInline: "clamp(16px, 4vw, 28px)", background: BG }}>
      <div style={{ maxInlineSize: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 60, alignItems: "center" }}>
          <FadeIn delay={0.2}>
            <div>
              <SectionHeading tag="تتبع التقدم" title="اعرف دائمًا ما يأتي بعده" subtitle="منارة تنظّم رحلتك التعليمية بحيث تعرف دائمًا أين أنت وأين تتجه." />
              <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "اكتمال الدورة",  desc: "نسبة مرئية وواضحة للتقدم الكلي" },
                  { label: "الدرس الحالي",   desc: "دائمًا تعرف ما تعمل عليه الآن" },
                  { label: "الدرس القادم",   desc: "الخطوة التالية دائمًا في متناول يدك" },
                  { label: "حالة الاختبارات", desc: "معرفة ما تم اختباره وما لم يُختبر بعد" },
                ].map(({ label, desc }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "4px 12px", flexWrap: "wrap", paddingBlock: 12, paddingInline: 16, borderRadius: 12, background: BG_SOFT, border: `1px solid ${BORDER}` }}>
                    <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: TEXT }}>{label}</span>
                    <span className="rs-longform" style={{ fontFamily: FONT, fontSize: 12.5, color: TEXT_MUTED, minInlineSize: 0 }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}><ProgressMockup /></FadeIn>
        </div>
      </div>
    </section>
  );
}
