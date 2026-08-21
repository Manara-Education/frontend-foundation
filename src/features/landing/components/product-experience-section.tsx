import { CheckCircle2, Play, Lock } from "lucide-react";
import { FadeIn, SectionHeading } from "./landing-primitives";
import { ChallengeCourseCard } from "./challenge-course-card";
import { PRIMARY, FONT, BG_SOFT, TEXT, TEXT_MUTED, TEXT_LIGHT, BORDER } from "./theme";

/** Section 6 — product experience. Renders the same card as the hero. */
export function ProductExperienceSection() {
  return (
    <section dir="rtl" style={{ padding: "100px 28px", background: BG_SOFT }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn><SectionHeading tag="رحلة تعلم ممتعة" title="رحلة تعلّم واحدة وواضحة" subtitle="شاهد كيف تُنظّم منارة مسيرتك من البداية حتى الإتقان." /></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center", marginTop: 60 }}>
          <FadeIn delay={0.1}><ChallengeCourseCard /></FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { icon: <CheckCircle2 size={18} color="#22C55E" />, title: "مكتمل",   desc: "الدروس التي أنجزتها تُعلَم بوضوح مع شعور حقيقي بالإنجاز." },
                { icon: <Play size={18} color={PRIMARY} />,         title: "جارٍ الآن", desc: "دائمًا تعرف الدرس الذي تعمل عليه في هذه اللحظة." },
                { icon: <Lock size={18} color={TEXT_LIGHT} />,      title: "القادم",   desc: "المحتوى القادم مرئي دائمًا ليحافظ على دوافعك نحو الأمام." },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: BG_SOFT, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                  <div>
                    <h4 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: TEXT, margin: "0 0 4px" }}>{title}</h4>
                    <p style={{ fontFamily: FONT, fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.7, margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
