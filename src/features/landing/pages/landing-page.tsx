import { useHashScroll } from "@/shared/navigation";
import { LandingContent } from "../components/landing-content";
import { useLanding } from "../hooks/use-landing";

export function LandingPage() {
  const landing = useLanding();
  // Brings /#courses into view when the footer or another page links here directly, the way a
  // real page load resolves a fragment on its own.
  useHashScroll();
  return <LandingContent {...landing} />;
}
