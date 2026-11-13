import { useSectionAnchor } from "@/features/legal/terms/hooks/use-section-anchor";
import { PrivacyPolicyContent } from "../components/privacy-policy-content";
import { usePrivacyPolicy } from "../hooks/use-privacy-policy";

/**
 * `/privacy` — readable by anyone, signed in or not.
 *
 * The text comes from the backend (`GET /api/v1/privacy-policy/current`), which is the canonical
 * source of both the policy and its version metadata. This page holds no copy of it. Deep links
 * such as `/privacy#retention` resolve once the sections have rendered.
 */
export function PrivacyPage() {
  const { state, retry } = usePrivacyPolicy();
  useSectionAnchor(state.status === "ready" ? state.policy : null);

  return <PrivacyPolicyContent state={state} onRetry={retry} />;
}
