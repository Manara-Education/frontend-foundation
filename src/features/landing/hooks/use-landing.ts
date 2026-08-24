import { useCallback } from "react";
import { useNavigate } from "react-router";
import { paths } from "@/shared/navigation";

/**
 * Navigation for the landing page's call-to-action buttons. Every destination
 * is a real application route — the reference prototype used raw
 * `window.location.href` assignments instead.
 */
export function useLanding() {
  const navigate = useNavigate();

  const onRegister = useCallback(() => navigate(paths.register), [navigate]);
  const onSignIn = useCallback(() => navigate(paths.login), [navigate]);

  return { onRegister, onSignIn };
}
