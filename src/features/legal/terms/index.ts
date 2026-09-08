/**
 * The terms feature's public surface.
 *
 * Registration depends on this feature — it cannot record a consent without knowing which
 * version the user was shown — so the pointer hook is exported here rather than reached for
 * through a deep path. Everything else (the content registry, the document components) is
 * internal to the terms page.
 */
export { useCurrentTerms } from "./hooks/use-current-terms";
export type { CurrentTermsStatus, UseCurrentTermsResult } from "./hooks/use-current-terms";
export { TermsPage } from "./pages/terms-page";
export type { CurrentTerms } from "./types/terms.types";
