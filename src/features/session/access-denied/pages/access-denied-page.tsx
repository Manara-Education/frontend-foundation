import { AccessDeniedCard } from "../components/access-denied-card";
import { useAccessDenied } from "../hooks/use-access-denied";

export function AccessDeniedPage() {
  const { handleLogout } = useAccessDenied();
  return <AccessDeniedCard handleLogout={handleLogout} />;
}
