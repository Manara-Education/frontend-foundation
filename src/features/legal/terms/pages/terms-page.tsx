import { TermsContent } from "../components/terms-content";
import { useSectionAnchor } from "../hooks/use-section-anchor";
import { useTerms } from "../hooks/use-terms";

/**
 * `/terms` — readable by anyone, signed in or not.
 *
 * It carries no guard in the route table for exactly that reason: a visitor must be able to
 * read what they are about to agree to before they have an account, and a signed-in user
 * must be able to re-read it afterwards.
 *
 * Deep links into it — `/terms#section-6` is the refund clause the footer points at — are
 * resolved once the text has actually rendered, which the browser cannot do by itself for a
 * document that arrives after the page loads.
 */
export function TermsPage() {
  const { state, retry } = useTerms();
  useSectionAnchor(state.status === "ready" ? state.document : null);

  return <TermsContent state={state} onRetry={retry} />;
}
