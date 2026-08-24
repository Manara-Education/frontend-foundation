import { useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { FadeIn, SectionHeading } from "./landing-primitives";
import { QuizMockup } from "./quiz-mockup";
import { PRIMARY, FONT, BG, TEXT_MUTED } from "./theme";

/** Section 7 — quizzes. */
export function QuizSection() {
  const [showHint, setShowHint] = useState(false);
  return (
    <section id="quiz" dir="rtl" style={{ padding: "100px 28px", background: BG }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 60, alignItems: "center" }}>
          <FadeIn delay={0.1}>
            <div>
              <QuizMockup showHint={showHint} />
              <button onClick={() => setShowHint(!showHint)} style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 7, fontFamily: FONT, fontSize: 13, color: PRIMARY, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                <Sparkles size={14} /> {showHint ? "إخفاء التلميح" : "جرّب طلب التلميح"}
              </button>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div>
              <SectionHeading tag="الاختبارات" title="تعلّم. تدرّب. افهم." subtitle="اختبارات تفاعلية مدمجة في كل مرحلة تثبّت الفهم وتُعزّز الاستيعاب الحقيقي." />
              <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>
                {["أسئلة متعددة الخيارات مرتبطة بالمحتوى", "تغذية راجعة فورية عند الإجابة", "تلميح ذكي عند التوقف — دون كشف الإجابة", "تتبع نتائج الاختبارات عبر الدورة"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <CheckCircle2 size={16} color="#22C55E" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: FONT, fontSize: 14, color: TEXT_MUTED, lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
