import { motion } from "motion/react";
import type { CourseDetailData, CourseDetailsMode } from "../types/course-details.types";
import { Breadcrumb } from "./breadcrumb";
import { ContinueLearningCard } from "./continue-learning-card";
import { CurriculumSection } from "./curriculum-section";
import { DescriptionSection } from "./description-section";
import { HeroSection } from "./hero-section";
import { InstructorSection } from "./instructor-section";
import { PaymentCTASection } from "./payment-cta-section";
import { BrowseCurriculumSection } from "./browse-curriculum-section";

interface CourseDetailsFormProps {
  courseData: CourseDetailData;
  courseId: number;
  mode: CourseDetailsMode;
  browsePrice: number | null;
  onBack: () => void;
  onLessonClick?: (lessonId: number) => void;
  onEnrolled: () => void;
  onProgressionChanged: () => void;
}

export function CourseDetailsForm({
  courseData,
  courseId,
  mode,
  browsePrice,
  onBack,
  onLessonClick,
  onEnrolled,
  onProgressionChanged,
}: CourseDetailsFormProps) {
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
          <PaymentCTASection course={courseData} price={browsePrice} onPay={onEnrolled} />
          <BrowseCurriculumSection
            lessons={courseData.lessons}
            modules={courseData.modules}
            structure={courseData.structure}
            enrolled={false}
          />
        </>
      ) : (
        <>
          <ContinueLearningCard course={courseData} onLessonClick={onLessonClick} />
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
