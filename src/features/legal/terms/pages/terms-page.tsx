import { TermsContent } from "../components/terms-content";
import { useTerms } from "../hooks/use-terms";

/**
 * `/terms` — readable by anyone, signed in or not.
 *
 * It carries no guard in the route table for exactly that reason: a visitor must be able to
 * read what they are about to agree to before they have an account, and a signed-in user
 * must be able to re-read it afterwards.
 */
export function TermsPage() {
  const { state, retry } = useTerms();

  return <TermsContent state={state} onRetry={retry} />;
}
