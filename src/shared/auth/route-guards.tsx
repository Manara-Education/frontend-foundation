import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "./auth-context";
import { SessionLoadingScreen } from "@/features/session/loading/components/session-loading-screen";
import { AccessDeniedCard } from "@/features/session/access-denied/components/access-denied-card";

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] } = {}) {
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (status === "loading") return <SessionLoadingScreen />;
  if (status === "anonymous")
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <AccessDeniedCard
        handleLogout={async () => {
          await logout();
          navigate("/login", { replace: true });
        }}
      />
    );
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === "loading") return <SessionLoadingScreen />;
  if (status === "authenticated") return <Navigate to="/main" replace />;
  return <Outlet />;
}
