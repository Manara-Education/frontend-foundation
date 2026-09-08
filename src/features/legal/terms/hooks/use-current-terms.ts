import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentTerms } from "../services/terms.service";
import type { CurrentTerms } from "../types/terms.types";

export type CurrentTermsStatus = "loading" | "ready" | "error";

export interface UseCurrentTermsResult {
  status: CurrentTermsStatus;
  /** The version in force, or `null` while loading and after a failure. Never a guess. */
  current: CurrentTerms | null;
  /** Re-asks the server. Used when the server says the version we were shown is stale. */
  refresh: () => void;
}

/**
 * The current terms version, as told by the server.
 *
 * Two screens need this answer — the terms page, to know which text to render, and the
 * registration form, to know which version a consent is being given for — so it lives in
 * one place rather than being fetched twice with two chances to disagree.
 *
 * A failure leaves `current` as `null` on purpose. There is no cached last-known version and
 * no default: a consent recorded against a version the user was never actually shown is
 * worse than no consent at all, so callers are forced to handle "we do not know".
 */
export function useCurrentTerms(): UseCurrentTermsResult {
  const [status, setStatus] = useState<CurrentTermsStatus>("loading");
  const [current, setCurrent] = useState<CurrentTerms | null>(null);

  /*
    A refresh can overtake the request it replaces. Only the newest request is allowed to
    write, so a slow first response cannot land on top of a fresh version after a 409.
  */
  const requestId = useRef(0);
  const mounted = useRef(true);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setStatus("loading");
    setCurrent(null);

    getCurrentTerms()
      .then((terms) => {
        if (!mounted.current || id !== requestId.current) return;
        setCurrent(terms);
        setStatus("ready");
      })
      .catch(() => {
        if (!mounted.current || id !== requestId.current) return;
        setCurrent(null);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { status, current, refresh: load };
}
