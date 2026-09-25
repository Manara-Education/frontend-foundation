import type { PublicCourseListState } from "@/features/public-courses/types/public-courses.types";
import { LandingNavbar } from "./landing-navbar";
import { LandingFooter } from "./landing-footer";
import { HeroSection } from "./hero-section";
import { ProblemSection } from "./problem-section";
import { FeaturesSection } from "./features-section";
import { HowItWorksSection } from "./how-it-works-section";
import { ProductExperienceSection } from "./product-experience-section";
import { QuizSection } from "./quiz-section";
import { AiHintSection } from "./ai-hint-section";
import { ProgressSection } from "./progress-section";
import { CoursesSection } from "./courses-section";
import { VisionSection } from "./vision-section";
import { FONT } from "./theme";

interface LandingContentProps {
  onRegister: () => void;
  onSignIn: () => void;
  /** The real courses on offer, from the public catalogue. */
  courses: PublicCourseListState;
  onRetryCourses: () => void;
}

export function LandingContent({ onRegister, onSignIn, courses, onRetryCourses }: LandingContentProps) {
  return (
    <div style={{ fontFamily: FONT }}>
      <LandingNavbar onSignIn={onSignIn} />
      <main>
        <HeroSection onCta={onRegister} />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ProductExperienceSection />
        <QuizSection />
        <AiHintSection />
        <ProgressSection />
        <CoursesSection state={courses} onRetry={onRetryCourses} />
        <VisionSection />
      </main>
      <LandingFooter />
    </div>
  );
}
