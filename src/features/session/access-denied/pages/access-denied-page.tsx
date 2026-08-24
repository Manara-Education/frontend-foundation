import { useAuth } from "@/shared/auth";
import { homePathForRole } from "@/shared/navigation";
import { AccessDeniedCard } from "../components/access-denied-card";
import { useAccessDenied } from "../hooks/use-access-denied";

export function AccessDeniedPage() {
  const { handleLogout } = useAccessDenied();
  const { user } = useAuth();
  return <AccessDeniedCard handleLogout={handleLogout} homePath={homePathForRole(user?.role)} />;
}
