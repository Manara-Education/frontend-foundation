import { InvoicesContent } from "../components/invoices-content";
import { SubscriptionsContent } from "../components/subscriptions-content";
import { TransactionDrawer } from "../components/transaction-drawer";
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
