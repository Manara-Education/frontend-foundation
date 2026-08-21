import { LandingNavbar } from "./landing-navbar";
import { LandingFooter } from "./landing-footer";
import { HeroSection } from "./hero-section";
import { EarlyAccessSection } from "./early-access-section";
import { ProblemSection } from "./problem-section";
import { FeaturesSection } from "./features-section";
import { HowItWorksSection } from "./how-it-works-section";
import { ProductExperienceSection } from "./product-experience-section";
import { QuizSection } from "./quiz-section";
import { AiHintSection } from "./ai-hint-section";
import { ProgressSection } from "./progress-section";
import { CoursesSection } from "./courses-section";
import { InstructorsSection } from "./instructors-section";
import { VisionSection } from "./vision-section";
import { CtaSection } from "./cta-section";
import { FONT } from "./theme";

interface LandingContentProps {
  onRegister: () => void;
  onSignIn: () => void;
}

export function LandingContent({ onRegister, onSignIn }: LandingContentProps) {
  return (
    <div style={{ fontFamily: FONT, overflowX: "hidden" }}>
      <LandingNavbar onSignIn={onSignIn} />
      <main>
        <HeroSection onCta={onRegister} />
        <EarlyAccessSection onCta={onRegister} />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ProductExperienceSection />
        <QuizSection />
        <AiHintSection />
        <ProgressSection />
        <CoursesSection />
        <InstructorsSection onCta={onRegister} />
        <VisionSection />
        <CtaSection onCta={onRegister} />
      </main>
      <LandingFooter />
    </div>
  );
}
