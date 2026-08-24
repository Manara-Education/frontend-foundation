import { Navigate, Outlet, useLocation } from "react-router";
import { AccessDeniedCard } from "@/features/session/access-denied/components/access-denied-card";
import { SessionLoadingScreen } from "@/features/session/loading/components/session-loading-screen";
import { useDocumentTitleOverride } from "@/shared/navigation/document-title";
import { homePathForRole, paths, resolvePostLoginPath } from "@/shared/navigation/paths";
import { useAuth } from "./auth-context";
import { postAuthPath } from "./auth.routes";
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
 * a flash of the wrong page behind. It is also what stops the application appearing for
 * an instant in front of an account that is about to be sent to the password screen.
 *
 * An account the server says owes a password change is entitled to exactly one screen,
 * whatever it asked for. That rule lives here rather than in the login screen because
 * signing in is only one of the ways into the application: a typed URL, a refresh, the
 * back button, a sidebar link and a restored session all arrive through this guard, and
 * every one of them gets the same answer from the same line.
 *
 * The password screen itself is deliberately not nested under this guard — it would
 * redirect to itself. It sits ungated in the route table and decides for itself why it
 * was reached.
 */
export function ProtectedRoute() {
  const { status, user } = useAuth();
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

  if (user?.requiresPasswordReset) return <Navigate to={paths.resetPassword} replace />;

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
  // Session-level concerns — no session at all, or an account that owes a password change
  // — are ProtectedRoute's to answer. Delegating keeps one copy of those rules, and keeps
  // this guard correct even though the route table already nests it inside that one.
  if (status === "anonymous" || user?.requiresPasswordReset) return <ProtectedRoute />;

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
 * role can open it, and to their own home otherwise — except when the account owes a
 * password change, which outranks any remembered destination.
 */
export function PublicOnlyRoute() {
  const { status, user } = useAuth();
  const location = useLocation();
  const state = location.state as FromLocationState | null;

  if (status === "loading") return <SessionLoadingScreen />;
  if (status === "authenticated") {
    return <Navigate to={postAuthPath(user, state?.from)} replace />;
  }

  return <Outlet />;
}
