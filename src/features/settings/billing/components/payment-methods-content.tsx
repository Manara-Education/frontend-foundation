import { CreditCard, RotateCw } from "lucide-react";
import { Skeleton } from "@/shared/components/skeleton";
import { FAINT, FONT, INK, MUTED, PRIMARY, SURFACE_TINT, cardStyle } from "../../components/settings-tokens";
import type { PaymentMethodsState } from "../hooks/use-payment-methods";
import type { BillingCapabilitiesResponse } from "../types/billing.types";

/** Why saving a method is not offered, in the deployment's own terms. */
function reason(capabilities: BillingCapabilitiesResponse): string {
  if (capabilities.commerceMode === "FREE_ONLY") return "الدفع الإلكتروني غير مفعّل على منارة حاليًا، لذلك لا توجد طرق دفع لحفظها.";
  if (capabilities.commerceMode === "DEMONSTRATION") return "هذه بيئة تجريبية تُحاكي الدفع فقط، ولا تُحفظ فيها طرق دفع حقيقية.";
  return "حفظ طرق الدفع غير متاح لدى مزوّد الدفع الحالي.";
}

/**
 * "طرق الدفع". Saved methods need a payment provider's hosted setup and tokens; until the server
 * reports that capability, this section explains its absence and offers no add action. Card
 * numbers are never collected by Manara in any case.
 */
export function PaymentMethodsContent({ state, retry }: { state: PaymentMethodsState; retry: () => void }) {
  if (state.status === "loading") return <Skeleton className="h-40 rounded-[20px]" />;
  if (state.status === "error") {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center" style={{ ...cardStyle, fontFamily: FONT }}>
        <p style={{ fontSize: 14, color: MUTED }}>تعذّر تحميل إعدادات الدفع.</p>
        <button type="button" onClick={retry} className="inline-flex items-center gap-2 rounded-xl px-4 py-2" style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: "#fff", background: PRIMARY, border: "none" }}>
          <RotateCw size={14} aria-hidden="true" /> إعادة المحاولة
        </button>
      </div>
    );
  }
  const { capabilities } = state;
  if (capabilities.savedMethods) {
    // Reached only once a provider adapter reports the capability; the list and setup flow arrive with it.
    return null;
  }
  return (
    <section className="flex flex-col items-center gap-3 px-6 py-12 text-center" style={{ ...cardStyle, fontFamily: FONT }}>
      <span className="flex items-center justify-center rounded-2xl" style={{ width: 56, height: 56, background: SURFACE_TINT, color: PRIMARY }}>
        <CreditCard size={24} aria-hidden="true" />
      </span>
      <h2 style={{ fontWeight: 700, fontSize: 17, color: INK }}>طرق الدفع</h2>
      <p style={{ fontSize: 13.5, color: FAINT, maxWidth: 440, lineHeight: 1.8 }}>{reason(capabilities)}</p>
      <p style={{ fontSize: 12, color: FAINT }}>لا تُدخل بيانات بطاقتك في منارة مطلقًا؛ عند تفعيل الدفع ستُجمع عبر صفحة مزوّد الدفع مباشرة.</p>
    </section>
  );
}
