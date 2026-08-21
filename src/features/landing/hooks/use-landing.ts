import { useCallback } from "react";
import { useNavigate } from "react-router";

/**
 * Navigation for the landing page's call-to-action buttons. Every destination
 * is a real application route — the reference prototype used raw
 * `window.location.href` assignments instead.
 */
export function useLanding() {
  const navigate = useNavigate();

  const onRegister = useCallback(() => navigate("/register"), [navigate]);
  const onSignIn = useCallback(() => navigate("/login"), [navigate]);

  return { onRegister, onSignIn };
}
