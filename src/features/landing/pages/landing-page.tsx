import { LandingContent } from "../components/landing-content";
import { useLanding } from "../hooks/use-landing";

export function LandingPage() {
  const landing = useLanding();
  return <LandingContent {...landing} />;
}
