import { useCallback } from "react";
import { useNavigate } from "react-router";
import { paths } from "@/shared/navigation/paths";
import { useAuth } from "./auth-context";

/**
 * Signing out, from wherever it is offered.
 *
 * The navigation happens first and the session teardown second. Dropping the session
 * while a protected screen is still mounted would let `ProtectedRoute` fire its own
 * redirect to the login screen — remembering the page being left as a "come back here"
 * destination — and the deliberate destination would then have to undo it. Leaving first
 * means only one navigation ever happens, and the user lands on the public front door.
 */
export function useLogoutAction(): () => Promise<void> {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useCallback(async () => {
    navigate(paths.landing, { replace: true });
    await logout();
  }, [logout, navigate]);
}
