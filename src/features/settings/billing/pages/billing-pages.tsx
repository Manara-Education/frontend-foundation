import { InvoicesContent } from "../components/invoices-content";
import { PaymentMethodsContent } from "../components/payment-methods-content";
import { SubscriptionsContent } from "../components/subscriptions-content";
import { TransactionDrawer } from "../components/transaction-drawer";
import { usePaymentMethods } from "../hooks/use-payment-methods";
import { useSubscriptions } from "../hooks/use-subscriptions";
import { useTransactionDrawer } from "../hooks/use-transaction-drawer";
import { useTransactions } from "../hooks/use-transactions";

export function SubscriptionsPage() {
  return <SubscriptionsContent {...useSubscriptions()} />;
}

export function InvoicesPage() {
  const transactions = useTransactions();
  const drawer = useTransactionDrawer();
  return (
    <>
      <InvoicesContent {...transactions} />
      <TransactionDrawer {...drawer} />
    </>
  );
}

export function PaymentMethodsPage() {
  return <PaymentMethodsContent {...usePaymentMethods()} />;
}
