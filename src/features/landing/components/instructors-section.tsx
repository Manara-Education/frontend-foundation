import { CheckCircle2, GraduationCap } from "lucide-react";
import { FadeIn, SectionHeading } from "./landing-primitives";
import { InstructorMockup } from "./instructor-mockup";
import { PRIMARY, FONT, BG, TEXT_MUTED } from "./theme";

/** Section 11 — for instructors. */
export function InstructorsSection({ onCta }: { onCta: () => void }) {
  return (
    <section id="instructors" dir="rtl" style={{ padding: "100px 28px", background: BG }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 60, alignItems: "center" }}>
          <FadeIn delay={0.1}>
            <div>
              <SectionHeading tag="للمدرسين" title="ابنِ تجارب تعليمية لا مجرد محتوى" subtitle="منارة تمنح المدرسين الأدوات لبناء دورات منظّمة ودروس تفاعلية واختبارات فعّالة." />
              <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 14 }}>
                {["أنشئ دورات منظّمة بخطوات واضحة", "رتّب الدروس والأقسام بسهولة", "أضف اختبارات لكل مرحلة تعليمية", "راجع تقدم الطلاب في محتواك", "انشر المادة العلمية عند جهوزيتها"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircle2 size={16} color="#22C55E" style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: FONT, fontSize: 14, color: TEXT_MUTED }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 36 }}>
                <button onClick={onCta} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 52, paddingLeft: 28, paddingRight: 28, borderRadius: 14, background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`, color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
                  <GraduationCap size={16} /> انضم كمدرّس
                </button>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}><InstructorMockup /></FadeIn>
        </div>
      </div>
    </section>
  );
}
