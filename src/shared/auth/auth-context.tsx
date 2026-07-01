import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ApiError,
  registerCsrfBootstrap,
  registerUnauthenticatedHandler,
} from "@/shared/api";
import { csrfRequest, logoutRequest, meRequest } from "./auth.api";
import type { AuthStatus, AuthUser } from "./auth.types";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  setUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

async function bootstrapCsrf() {
  await csrfRequest();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    registerCsrfBootstrap(bootstrapCsrf);
    registerUnauthenticatedHandler(() => {
      setUserState(null);
      setStatus("anonymous");
    });
  }, []);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    (async () => {
      const minDelay = new Promise((r) => setTimeout(r, 2000));

      try {
        await bootstrapCsrf();
      } catch {
        // CSRF seeding failure is non-fatal here; subsequent POSTs will retry once on 403.
      }

      try {
        const { data: body } = await meRequest();
        await minDelay;
        if (body.data) {
          setUserState(body.data);
          setStatus("authenticated");
        } else {
          setStatus("anonymous");
        }
      } catch (err) {
        await minDelay;
        if (err instanceof ApiError && err.statusCode === 401) {
          setStatus("anonymous");
        } else {
          setStatus("anonymous");
        }
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      setUser: (u) => {
        setUserState(u);
        setStatus("authenticated");
      },
      logout: async () => {
        try {
          await logoutRequest();
        } catch {
          // Even if the server call fails, drop local state.
        }
        setUserState(null);
        setStatus("anonymous");
        // Logout invalidates the server session and regenerates its CSRF token.
        // The XSRF-TOKEN cookie the browser still holds is now tied to the
        // destroyed session, so re-seed a fresh token bound to the new anonymous
        // session. Without this, the next login POST carries a stale X-XSRF-TOKEN
        // and is rejected by CSRF middleware before it reaches the login handler.
        // Awaited so callers navigate to the login screen only after re-seeding
        // completes, avoiding a cleanup/navigation race.
        try {
          await bootstrapCsrf();
        } catch {
          // Non-fatal: a failed POST still retries once on 403 via the interceptor.
        }
      },
    }),
    [user, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
