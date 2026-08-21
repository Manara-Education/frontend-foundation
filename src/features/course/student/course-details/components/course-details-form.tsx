import { motion } from "motion/react";
import type { CourseDetailData, CourseDetailsMode } from "../types/course-details.types";
import { Breadcrumb } from "./breadcrumb";
import { ContinueLearningCard } from "./continue-learning-card";
import { CurriculumSection } from "./curriculum-section";
import { DescriptionSection } from "./description-section";
import { HeroSection } from "./hero-section";
import { InstructorSection } from "./instructor-section";
import { PaymentCTASection } from "./payment-cta-section";
import { SubscriptionCTASection } from "./subscription-cta-section";
import { SubscriptionStatusCard } from "./subscription-status-card";
import { BrowseCurriculumSection } from "./browse-curriculum-section";

interface CourseDetailsFormProps {
  courseData: CourseDetailData;
  courseId: number;
  mode: CourseDetailsMode;
  onBack: () => void;
  onLessonClick?: (lessonId: number) => void;
  onEnrolled: () => void;
  onProgressionChanged: () => void;
}

export function CourseDetailsForm({
  courseData,
  courseId,
  mode,
  onBack,
  onLessonClick,
  onEnrolled,
  onProgressionChanged,
}: CourseDetailsFormProps) {
  const { access, accessType, subscriptionPlans } = courseData;

  // A subscription's standing has its own card — active, ending soon, or expired with the
  // renewal offer. It is shown whenever the learner has ever held one, including after it
  // lapsed, which is the state the renewal card exists for.
  const showSubscriptionStatus =
    accessType === "SUBSCRIPTION" && access.source === "SUBSCRIPTION" && access.status !== "NONE";

  // The reference hides "continue learning" behind an expired subscription, because there is
  // nothing left to continue into until it is renewed. The progress it describes is untouched.
  const canContinue = access.entitled;

  return (
    <motion.div
      key={`details-${courseId}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Breadcrumb onBack={onBack} mode={mode} />
      <HeroSection course={courseData} />

      {mode === "browse" ? (
        <>
          {/* Someone who already holds the course is not offered it again — reaching it from
              the catalogue rather than from their own list does not un-buy it. */}
          {access.entitled ? (
            <ContinueLearningCard course={courseData} onLessonClick={onLessonClick} />
          ) : accessType === "SUBSCRIPTION" ? (
            <SubscriptionCTASection
              course={courseData}
              plans={subscriptionPlans}
              onPay={onEnrolled}
            />
          ) : (
            <PaymentCTASection course={courseData} onPay={onEnrolled} />
          )}

          <BrowseCurriculumSection
            lessons={courseData.lessons}
            modules={courseData.modules}
            structure={courseData.structure}
            enrolled={access.entitled}
          />
        </>
      ) : (
        <>
          {showSubscriptionStatus && (
            <SubscriptionStatusCard
              course={courseData}
              access={access}
              plans={subscriptionPlans}
              onRenewed={onProgressionChanged}
            />
          )}

          {canContinue && (
            <ContinueLearningCard course={courseData} onLessonClick={onLessonClick} />
          )}

          <CurriculumSection
            courseId={courseId}
            lessons={courseData.lessons}
            modules={courseData.modules}
            structure={courseData.structure}
            finalQuiz={courseData.finalQuiz}
            onLessonClick={onLessonClick}
            onProgressionChanged={onProgressionChanged}
          />
        </>
      )}

      <DescriptionSection course={courseData} />
      <InstructorSection course={courseData} />
      <div style={{ height: 24 }} />
    </motion.div>
  );
}
