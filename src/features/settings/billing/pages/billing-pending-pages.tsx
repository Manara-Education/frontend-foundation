import { CreditCard } from "lucide-react";
import { PendingCapability } from "../../components/pending-capability";

/*
  Saved payment methods need a payment provider (phase 07). Until one is integrated the section
  says so and offers nothing to act on.
*/

export function PaymentMethodsPendingPage() {
  return (
    <PendingCapability
      icon={CreditCard}
      title="طرق الدفع"
      body="حفظ طرق الدفع غير متاح بعد. لا تُحفظ أي بيانات بطاقات في منارة."
    />
  );
}
