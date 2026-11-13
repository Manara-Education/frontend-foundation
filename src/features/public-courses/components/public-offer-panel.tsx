import type { CSSProperties, ReactNode } from "react";
import { BORDER, FONT, PRIMARY, TEXT, TEXT_MUTED } from "@/features/landing/components/theme";
import { formatMoney, formatMoneySpoken, formatPlanTerm } from "../formatters/public-offer.formatter";
import { usePublicCourseCta, type PublicCourseCta } from "../hooks/use-public-course-cta";
import type { PublicCourseDetail, PublicOffer } from "../types/public-courses.types";
import { OfferBadge } from "./offer-badge";

const HEADING_ID = "public-course-offer-heading";
const FOCUS_CLASS = "focus-visible:outline-2 focus-visible:outline-offset-2";

const BUTTON_BASE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  inlineSize: "100%",
  minBlockSize: 48,
  paddingInline: 20,
  borderRadius: 14,
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  outlineColor: PRIMARY,
};

function PrimaryButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={FOCUS_CLASS}
      style={{ ...BUTTON_BASE, color: "#FFFFFF", border: "none", background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`, boxShadow: "0 4px 18px rgba(78,91,146,0.26)" }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={FOCUS_CLASS}
      style={{ ...BUTTON_BASE, color: PRIMARY, background: "transparent", border: `1.5px solid ${BORDER}` }}
    >
      {children}
    </button>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT_MUTED, lineHeight: 1.9, margin: 0 }}>{children}</p>;
}

/** What "go ahead" is called for this offer. */
function actionLabel(offer: PublicOffer): string {
  if (offer.kind === "FREE") return "ابدأ الدورة";
  if (offer.kind === "SUBSCRIPTION") return "اختر خطة الاشتراك";
  return "متابعة للشراء";
}

function Actions({ cta, offer }: { cta: PublicCourseCta; offer: PublicOffer }) {
  if (cta.kind === "not-for-this-account") {
    return <Note>الاشتراك في الدورات وشراؤها متاحان لحسابات الطلاب.</Note>;
  }
  if (cta.kind === "continue") {
    return <PrimaryButton onClick={cta.onContinue}>{actionLabel(offer)}</PrimaryButton>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <PrimaryButton onClick={cta.onSignIn}>سجّل الدخول للمتابعة</PrimaryButton>
      <SecondaryButton onClick={cta.onRegister}>إنشاء حساب جديد</SecondaryButton>
      <Note>{offer.kind === "FREE" ? "يتطلب الانضمام إلى الدورة حسابًا على منارة." : "يتم الاشتراك أو الشراء بعد تسجيل الدخول."}</Note>
    </div>
  );
}

/**
 * The price panel of a public course page: the offer, each subscription plan, and the way on.
 *
 * An offer whose price cannot be stated gets no action at all. Inviting someone to pay for
 * something the page cannot price would be the misleading case this feature exists to avoid,
 * and checkout would refuse it anyway.
 */
export function PublicOfferPanel({ course }: { course: PublicCourseDetail }) {
  const cta = usePublicCourseCta(course.id);
  const { offer } = course;

  return (
    <section
      aria-labelledby={HEADING_ID}
      style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 22, padding: "clamp(18px, 4vw, 24px)", display: "flex", flexDirection: "column", gap: 18 }}
    >
      <h2 id={HEADING_ID} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: TEXT, margin: 0 }}>
        السعر والوصول
      </h2>

      <OfferBadge offer={offer} size="lg" />

      {offer.kind === "SUBSCRIPTION" && (
        <ul aria-label="خطط الاشتراك" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {offer.plans.map((plan) => (
            <li
              key={plan.id}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "10px 14px", fontFamily: FONT, fontSize: 14, color: TEXT }}
            >
              <span style={{ minInlineSize: 0, overflowWrap: "anywhere" }}>
                {plan.name}
                <span style={{ color: TEXT_MUTED }}> · لمدة {formatPlanTerm(plan)}</span>
              </span>
              <span style={{ fontWeight: 700, color: PRIMARY, whiteSpace: "nowrap" }}>
                <span aria-hidden="true">{formatMoney(plan.price)}</span>
                <span className="sr-only">{formatMoneySpoken(plan.price)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {offer.kind === "UNAVAILABLE" ? (
        <Note>لا يمكن عرض سعر هذه الدورة حاليًا، لذلك لا يتوفر الاشتراك فيها أو شراؤها من هذه الصفحة.</Note>
      ) : (
        <Actions cta={cta} offer={offer} />
      )}
    </section>
  );
}
