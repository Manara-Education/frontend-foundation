import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { BookOpen, ListChecks, Map as MapIcon } from "lucide-react";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { PublicHeader } from "@/features/landing/components/public-header";
import { PublicBreadcrumb } from "@/features/landing/components/public-breadcrumb";
import { BORDER, FONT, PRIMARY, TEXT, TEXT_MUTED, BG_SOFT } from "@/features/landing/components/theme";
import { PUBLIC_BUSINESS_FACTS } from "@/shared/business";
import { paths } from "@/shared/navigation/paths";

const VALUES = [
  {
    Icon: ListChecks,
    title: "وضوح الرحلة التعليمية",
    body: "الدورة مقسّمة إلى دروس ومراحل مرتّبة، فتعرف موضعك من المسار وما الخطوة التالية.",
  },
  {
    Icon: BookOpen,
    title: "سهولة الوصول إلى المعرفة",
    body: "صفحة كل دورة تعرض محتواها وسعرها وخيارات الانضمام، ويمكن قراءتها دون حساب.",
  },
  {
    Icon: MapIcon,
    title: "التعلّم بخطوات منظّمة",
    body: "تتقدّم درسًا بعد درس، ويظل ما أنجزته وما ينتظرك مرئيًا أمامك في كل وقت.",
  },
];

const STEPS = [
  { number: "٠١", title: "اكتشف الدورة المناسبة", body: "اطّلع على الدورات المعروضة واختر ما يناسب هدفك." },
  { number: "٠٢", title: "اطّلع على المحتوى وخيارات الانضمام", body: "صفحة الدورة توضّح دروسها وسعرها وما تحتاجه للانضمام." },
  { number: "٠٣", title: "ابدأ رحلتك التعليمية", body: "تبدأ من الدرس الأول، ويظل تقدّمك واضحًا أمامك." },
];

export function AboutPage() {
  return (
    <div dir="rtl" style={{ background: BG_SOFT, minHeight: "100dvh", fontFamily: FONT, display: "flex", flexDirection: "column" }}>
      <PublicHeader />

      <main style={{ flex: "1 1 auto", inlineSize: "100%", maxInlineSize: 1100, margin: "0 auto", padding: "clamp(20px, 4vw, 36px) clamp(16px, 4vw, 40px) clamp(56px, 8vw, 84px)" }}>
        <PublicBreadcrumb current={`عن ${PUBLIC_BUSINESS_FACTS.brand.arabic}`} />

        <header style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 24, padding: "clamp(26px, 4vw, 44px)", boxShadow: "0 2px 16px rgba(78,91,146,0.05)" }}>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, color: PRIMARY, background: "rgba(78,91,146,0.07)", border: "1px solid rgba(78,91,146,0.13)", borderRadius: 99, padding: "4px 14px", marginBlockEnd: 16 }}>
            عن {PUBLIC_BUSINESS_FACTS.brand.arabic}
          </span>
          <h1 style={{ fontWeight: 800, fontSize: "clamp(26px, 4vw, 38px)", color: TEXT, lineHeight: 1.35, margin: "0 0 10px", overflowWrap: "anywhere" }}>
            عن {PUBLIC_BUSINESS_FACTS.brand.arabic}
          </h1>
          <p style={{ fontWeight: 700, fontSize: "clamp(18px, 2.6vw, 24px)", color: PRIMARY, lineHeight: 1.6, margin: "0 0 18px" }}>
            تعلّم بوضوح، وتقدّم بثقة
          </p>
          <p className="rs-longform" style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 2, margin: 0, maxInlineSize: 760, overflowWrap: "anywhere" }}>
            {PUBLIC_BUSINESS_FACTS.brand.arabic} منصة تعلّم عربية تساعدك على اكتشاف الدورات المتاحة، ومعرفة ما تحتويه كل دورة وسعرها قبل الانضمام إليها، ثم متابعة تقدّمك بعد أن تبدأ. الدورة مقسّمة إلى دروس ومراحل مرتّبة، حتى تعرف في كل خطوة ما تتعلّمه الآن وما يأتي بعده.
          </p>
        </header>

        <section aria-labelledby="mission-heading" style={{ marginBlockStart: 20, background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 24, padding: "clamp(24px, 4vw, 36px)" }}>
          <h2 id="mission-heading" style={{ fontWeight: 700, fontSize: "clamp(19px, 2.4vw, 22px)", color: TEXT, lineHeight: 1.6, margin: "0 0 16px" }}>رسالتنا</h2>
          <div style={{ display: "flex", gap: 16, minInlineSize: 0 }}>
            <div style={{ inlineSize: 3, borderRadius: 99, background: PRIMARY, flexShrink: 0 }} />
            <div style={{ minInlineSize: 0 }}>
              <p className="rs-longform" style={{ fontSize: 15.5, color: TEXT_MUTED, lineHeight: 2, margin: 0, overflowWrap: "anywhere" }}>
                أن يكون التعلّم أوضح وأسهل في التنقّل. نعمل على تقليل ما يشتّت المتعلّم: مسار مرتّب بدل محتوى متفرّق، ومعلومات صريحة عن كل دورة قبل الالتزام بها، وصورة واضحة عن موضعك في الرحلة بعد أن تبدأ.
              </p>
              <p style={{ fontSize: 13.5, color: "#9BA3C4", lineHeight: 1.9, margin: "14px 0 0", overflowWrap: "anywhere" }}>
                {PUBLIC_BUSINESS_FACTS.brand.arabic} في مرحلة تطوير مبكر، وتُضاف الدورات والمزايا تدريجيًا.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="values-heading" style={{ marginBlockStart: 20 }}>
          <h2 id="values-heading" style={{ fontWeight: 700, fontSize: "clamp(19px, 2.4vw, 22px)", color: TEXT, lineHeight: 1.6, margin: "0 0 18px", paddingInlineStart: 4 }}>ما نهتم به</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gap: 20 }}>
            {VALUES.map(({ Icon, title, body }) => (
              <article key={title} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 22, paddingBlock: 30, paddingInline: "clamp(20px, 5vw, 28px)", boxShadow: "0 2px 16px rgba(78,91,146,0.05)", minInlineSize: 0 }}>
                <div style={{ inlineSize: 52, blockSize: 52, borderRadius: 15, background: "rgba(78,91,146,0.08)", color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", marginBlockEnd: 20 }}>
                  <Icon size={23} strokeWidth={1.6} aria-hidden="true" />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 17, color: TEXT, lineHeight: 1.6, margin: "0 0 10px", overflowWrap: "anywhere" }}>{title}</h3>
                <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.85, margin: 0, overflowWrap: "anywhere" }}>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="journey-heading" style={{ marginBlockStart: 20, background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 24, padding: "clamp(26px, 4vw, 40px)" }}>
          <h2 id="journey-heading" style={{ fontWeight: 700, fontSize: "clamp(19px, 2.4vw, 22px)", color: TEXT, lineHeight: 1.6, margin: "0 0 6px" }}>كيف تبدأ</h2>
          <p style={{ fontSize: 15, color: TEXT_MUTED, lineHeight: 1.9, margin: "0 0 28px", maxInlineSize: 620 }}>ثلاث خطوات من الاكتشاف إلى أول درس.</p>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(230px, 100%), 1fr))", gap: 24 }}>
            {STEPS.map((step) => (
              <li key={step.number} style={{ minInlineSize: 0 }}>
                <div style={{ inlineSize: 56, blockSize: 56, borderRadius: 18, background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, boxShadow: "0 6px 20px rgba(78,91,146,0.28)", marginBlockEnd: 18 }}>
                  {step.number}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16.5, color: TEXT, lineHeight: 1.6, margin: "0 0 8px", overflowWrap: "anywhere" }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.85, margin: 0, overflowWrap: "anywhere" }}>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="cta-heading" style={{ marginBlockStart: 20, borderRadius: 28, background: `linear-gradient(135deg, ${PRIMARY} 0%, #364178 100%)`, boxShadow: "0 20px 60px rgba(78,91,146,0.22)", paddingBlock: "clamp(36px, 7vw, 56px)", paddingInline: "clamp(24px, 6vw, 48px)", textAlign: "center" }}>
          <h2 id="cta-heading" style={{ fontWeight: 800, fontSize: "clamp(22px, 3.4vw, 32px)", color: "#FFFFFF", lineHeight: 1.4, margin: "0 0 14px", overflowWrap: "anywhere" }}>ابدأ من الدورة التي تناسبك</h2>
          <p style={{ fontSize: 15.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.9, margin: "0 auto 30px", maxInlineSize: 520 }}>اطّلع على الدورات المعروضة، أو راسلنا إن كان لديك سؤال قبل البدء.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <Link
              to={paths.courses}
              replace
              className="focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minBlockSize: 52, paddingInline: 30, borderRadius: 14, background: "#FFFFFF", color: PRIMARY, fontWeight: 700, fontSize: 15, textDecoration: "none", outlineColor: "#FFFFFF" }}
            >
              استكشف الدورات
              <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
            <Link
              to={paths.contact}
              replace
              className="focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minBlockSize: 52, paddingInline: 26, borderRadius: 14, background: "transparent", border: "1.5px solid rgba(255,255,255,0.45)", color: "#FFFFFF", fontWeight: 600, fontSize: 15, textDecoration: "none", outlineColor: "#FFFFFF" }}
            >
              تواصل معنا
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
