import { findTermsDocument } from "../content";
import type { TermsViewState } from "../types/terms.types";
import { useCurrentTerms } from "./use-current-terms";

export interface UseTermsResult {
  state: TermsViewState;
  /** Re-asks the server which version is current. */
  retry: () => void;
}

/**
 * Joins the server's answer ("1.0 is in force") to the text this build carries.
 *
 * The join can fail, and the failure has its own state. If the backend names a version that
 * is not in the registry — a frontend deployed behind its backend — the page says so. The
 * one thing it must never do is fall back to the newest text it happens to have: that would
 * present a superseded contract as the one in force.
 */
export function useTerms(): UseTermsResult {
  const { status, current, refresh } = useCurrentTerms();

  if (status === "loading") return { state: { status: "loading" }, retry: refresh };
  if (status === "error" || !current) return { state: { status: "error" }, retry: refresh };

  const document = findTermsDocument(current.version);
  if (!document) return { state: { status: "unavailable", current }, retry: refresh };

  return { state: { status: "ready", current, document }, retry: refresh };
}
