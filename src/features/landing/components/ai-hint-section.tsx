import { Sparkles } from "lucide-react";
import { FadeIn, SectionHeading } from "./landing-primitives";
import { PRIMARY, FONT, BG_SOFT, TEXT, TEXT_MUTED, TEXT_LIGHT, BORDER } from "./theme";

/** Section 8 — AI hints. */
export function AiHintSection() {
  return (
    <section dir="rtl" style={{ paddingBlock: "clamp(72px, 10vw, 100px)", paddingInline: "clamp(16px, 4vw, 28px)", background: BG_SOFT }}>
      <div style={{ maxInlineSize: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 60, alignItems: "center" }}>
          <FadeIn delay={0.1}>
            <div>
              <SectionHeading tag="مساعدة ذكية" title="تلميح عندما تحتاجه" subtitle="بدلًا من الكشف الفوري عن الإجابة، تُقدّم منارة تلميحات سياقية تُساعدك على التفكير في المشكلة بنفسك." />
              <div style={{ marginTop: 28, paddingBlock: 20, paddingInline: "clamp(18px, 6vw, 22px)", borderRadius: 16, background: "#fff", border: `1px solid ${BORDER}`, display: "flex", gap: 6, minInlineSize: 0 }}>
                <div style={{ inlineSize: 3, borderRadius: 99, background: PRIMARY, flexShrink: 0 }} />
                <p className="rs-longform" style={{ fontFamily: FONT, fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.8, marginBlock: 0, marginInline: 12 }}>
                  الذكاء الاصطناعي في منارة مساعد تعليمي — لا يحلّ محل المدرّس ولا يُقدّم الإجابات جاهزة، بل يُنبّهك إلى الاتجاه الصحيح.
                </p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="rs-longform" style={{ padding: "clamp(24px, 7vw, 32px)", borderRadius: 24, background: "#fff", border: `1px solid ${BORDER}`, boxShadow: "0 8px 40px rgba(78,91,146,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ inlineSize: 36, blockSize: 36, borderRadius: 10, background: `${PRIMARY}12`, color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Sparkles size={18} strokeWidth={1.8} />
                </div>
                <div style={{ minInlineSize: 0 }}>
                  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: TEXT }}>تلميح بواسطة الذكاء الاصطناعي</div>
                  <div style={{ fontFamily: FONT, fontSize: 11, color: TEXT_LIGHT }}>مخصّص لهذا السؤال</div>
                </div>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.85, margin: 0, borderInlineStart: `2px solid ${PRIMARY}30`, paddingInlineStart: 16 }}>
                فكّر في كيفية تأثير تغيير الحالة على دورة حياة المكوّن. حاول استبعاد الإجابات التي تتعارض مع آلية إعادة الرسم في React.
              </p>
              <div style={{ marginTop: 20, padding: "10px 14px", borderRadius: 10, background: BG_SOFT, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ inlineSize: 6, blockSize: 6, borderRadius: 99, background: "#22C55E", flexShrink: 0 }} />
                <span style={{ fontFamily: FONT, fontSize: 12, color: TEXT_MUTED }}>تلميح واحد لكل سؤال — لا يكشف الإجابة الكاملة</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
