import { useEffect, useRef } from "react";
import { useBlocker } from "react-router";

/**
 * Asks before an editor with unsaved input is left — by an in-app link, the back button, or
 * closing the tab.
 *
 * The dirty flag is read from a ref at the moment of navigation rather than from the render that
 * registered the blocker, so an editor that has just saved can `release()` and navigate in the
 * same tick without being stopped by its own guard.
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return {
    confirmingLeave: blocker.state === "blocked",
    stay: () => blocker.reset?.(),
    leave: () => blocker.proceed?.(),
    release: () => {
      dirtyRef.current = false;
    },
  };
}
