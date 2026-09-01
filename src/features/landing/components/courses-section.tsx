import { FadeIn, SectionHeading } from "./landing-primitives";
import { PRIMARY, FONT, BG_SOFT, TEXT, TEXT_LIGHT, BORDER } from "./theme";

/** Section 10 — sample courses. */
export function CoursesSection() {
  const courses = [
    { category: "تطوير الويب", title: "React من الصفر إلى الاحتراف",        level: "مبتدئ – متوسط", status: "قريبًا",      color: "#3B82F6" },
    { category: "لغة عربية",  title: "النحو المتقدم والتعبير الكتابي",     level: "متوسط",          status: "وصول مبكر",   color: PRIMARY },
    { category: "تلاوة",      title: "أحكام التجويد — مستوى متقدم",        level: "متقدم",          status: "قريبًا",      color: "#8B5CF6" },
    { category: "علوم",       title: "الفيزياء العامة للمرحلة الثانوية",   level: "مبتدئ",          status: "قريبًا",      color: "#F59E0B" },
  ];
  return (
    <section id="courses" dir="rtl" style={{ paddingBlock: "clamp(72px, 10vw, 100px)", paddingInline: "clamp(16px, 4vw, 28px)", background: BG_SOFT }}>
      <div style={{ maxInlineSize: 1100, margin: "0 auto" }}>
        <FadeIn><SectionHeading tag="الدورات" title="اكتشف ما قادم في منارة" subtitle="دورات احترافية يتم إعدادها الآن — ستُطلق قريبًا." /></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gap: 20, marginTop: 56 }}>
          {courses.map(({ category, title, level, status, color }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                <div style={{ blockSize: 8, background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)` }} />
                <div className="rs-longform" style={{ paddingBlock: "22px 24px", paddingInline: "clamp(18px, 6vw, 22px)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    <span style={{ fontFamily: FONT, fontSize: 11.5, fontWeight: 600, color, background: `${color}12`, border: `1px solid ${color}22`, borderRadius: 6, padding: "2px 10px" }}>{category}</span>
                    <span style={{ fontFamily: FONT, fontSize: 11, color: status === "وصول مبكر" ? "#22C55E" : TEXT_LIGHT, fontWeight: 600, background: status === "وصول مبكر" ? "rgba(34,197,94,0.1)" : "rgba(78,91,146,0.06)", borderRadius: 6, padding: "2px 10px" }}>{status}</span>
                  </div>
                  <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: TEXT, margin: "0 0 10px", lineHeight: 1.5 }}>{title}</h3>
                  <div style={{ fontFamily: FONT, fontSize: 12.5, color: TEXT_LIGHT }}>{level}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.2}>
          <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT_LIGHT, textAlign: "center", marginTop: 32 }}>هذه دورات نموذجية — الدورات الحقيقية ستُعلن عند إطلاقها</p>
        </FadeIn>
      </div>
    </section>
  );
}
