import { Navigate, Outlet, useLocation } from "react-router";
import { AccessDeniedCard } from "@/features/session/access-denied/components/access-denied-card";
import { SessionLoadingScreen } from "@/features/session/loading/components/session-loading-screen";
import { useDocumentTitleOverride } from "@/shared/navigation/document-title";
import { homePathForRole, paths, resolvePostLoginPath } from "@/shared/navigation/paths";
import { useAuth } from "./auth-context";
import { hasAnyRole } from "./roles";
import { useLogoutAction } from "./use-logout-action";

/** The URL a guard turned away, carried through the login screen in history state. */
export interface FromLocationState {
  from?: string;
}

function currentPath(pathname: string, search: string): string {
  return `${pathname}${search}`;
}

/**
 * The authentication gate.
 *
 * Nothing is decided while the session is still being read: an unresolved session is a
 * third state, not "signed out". Redirecting on it would bounce every deep link to the
 * login screen and then back again once `/me` answered, leaving a junk history entry and
 * a flash of the wrong page behind.
 */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <SessionLoadingScreen />;

  if (status === "anonymous") {
    return (
      <Navigate
        to={paths.login}
        replace
        state={{ from: currentPath(location.pathname, location.search) } satisfies FromLocationState}
      />
    );
  }

  return <Outlet />;
}

/**
 * The authorization gate for a role-owned area.
 *
 * A refused route is answered in place rather than redirected: the URL stays put, so a
 * refresh shows the same refusal instead of something else, and no history entry is spent
 * on the rejection. The card offers a way back into the part of the app the account does
 * own, which is what stops "access denied" from being a dead end.
 */
export function RoleRoute({ allowedRoles }: { allowedRoles: readonly string[] }) {
  const { status, user } = useAuth();
  const logout = useLogoutAction();

  if (status === "loading") return <SessionLoadingScreen />;
  if (status === "anonymous") return <ProtectedRoute />;

  if (!hasAnyRole(user?.role, allowedRoles)) {
    return <RoleRefused homePath={homePathForRole(user?.role)} onLogout={logout} />;
  }

  return <Outlet />;
}

/**
 * The refusal itself, split out so it can claim the document title. The route that was
 * asked for is still the matched one, and its title would otherwise name a page this
 * account was never shown.
 */
function RoleRefused({ homePath, onLogout }: { homePath: string; onLogout: () => void }) {
  useDocumentTitleOverride("وصول مرفوض");
  return <AccessDeniedCard handleLogout={onLogout} homePath={homePath} />;
}

/**
 * The sign-in screens, which a signed-in visitor has no business seeing.
 *
 * They are sent on to the page they were originally after, when there is one and their
 * role can open it, and to their own home otherwise.
 */
export function PublicOnlyRoute() {
  const { status, user } = useAuth();
  const location = useLocation();
  const state = location.state as FromLocationState | null;

  if (status === "loading") return <SessionLoadingScreen />;
  if (status === "authenticated") {
    return <Navigate to={resolvePostLoginPath(user?.role, state?.from)} replace />;
  }

  return <Outlet />;
}
