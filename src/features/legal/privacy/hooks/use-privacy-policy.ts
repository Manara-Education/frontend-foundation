import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, ApiErrorCode } from "@/shared/api";
import { getCurrentPrivacyPolicy } from "../services/privacy-policy.service";
import type { PrivacyPolicyViewState } from "../types/privacy-policy.types";

export interface UsePrivacyPolicyResult {
  state: PrivacyPolicyViewState;
  retry: () => void;
}

/**
 * The published privacy policy, as told by the server.
 *
 * Same request discipline as `useCurrentTerms`: only the newest request may write, and nothing is
 * cached or defaulted. A failure is a failure — there is no local copy of the policy to fall back
 * to, by design.
 */
export function usePrivacyPolicy(): UsePrivacyPolicyResult {
  const [state, setState] = useState<PrivacyPolicyViewState>({ status: "loading" });
  const requestId = useRef(0);
  const mounted = useRef(true);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setState({ status: "loading" });

    getCurrentPrivacyPolicy()
      .then((policy) => {
        if (!mounted.current || id !== requestId.current) return;
        setState({ status: "ready", policy });
      })
      .catch((error: unknown) => {
        if (!mounted.current || id !== requestId.current) return;
        const notPublished = error instanceof ApiError && error.is(ApiErrorCode.PRIVACY_POLICY_NOT_PUBLISHED);
        setState({ status: notPublished ? "not-published" : "error" });
      });
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { state, retry: load };
}
