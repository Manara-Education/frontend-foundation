import { AccountOverviewContent } from "../components/account-overview-content";
import { useAccountOverview } from "../hooks/use-account-overview";

export function AccountOverviewPage() {
  return <AccountOverviewContent {...useAccountOverview()} />;
}
