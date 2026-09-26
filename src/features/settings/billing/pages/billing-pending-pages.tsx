import { CreditCard, Receipt, Repeat } from "lucide-react";
import { PendingCapability } from "../../components/pending-capability";

/*
  Placeholders until the billing endpoints exist (phases 06–10). They state what the section
  will hold and nothing more: no totals, cards, invoices or actions.
*/

export function SubscriptionsPendingPage() {
  return (
    <PendingCapability
      icon={Repeat}
      title="الاشتراكات"
      body="ستظهر هنا اشتراكاتك في الدورات ومدة الوصول لكل منها. حتى ذلك الحين، تجد دوراتك في «دوراتي»."
    />
  );
}

export function PaymentMethodsPendingPage() {
  return (
    <PendingCapability
      icon={CreditCard}
      title="طرق الدفع"
      body="حفظ طرق الدفع غير متاح بعد. لا تُحفظ أي بيانات بطاقات في منارة."
    />
  );
}

export function InvoicesPendingPage() {
  return (
    <PendingCapability
      icon={Receipt}
      title="الفواتير والمدفوعات"
      body="سيظهر هنا سجل مدفوعاتك وإيصالاتها عند توفره."
    />
  );
}
