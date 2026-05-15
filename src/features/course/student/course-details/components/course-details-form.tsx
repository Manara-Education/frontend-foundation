import { motion } from "motion/react";
import type { CourseDetailData } from "../types/course-details.types";
import { Breadcrumb } from "./breadcrumb";
import { ContinueLearningCard } from "./continue-learning-card";
import { CurriculumSection } from "./curriculum-section";
import { DescriptionSection } from "./description-section";
import { HeroSection } from "./hero-section";
import { InstructorSection } from "./instructor-section";

interface CourseDetailsFormProps {
  courseData: CourseDetailData;
  courseId: number;
  onBack: () => void;
  onLessonClick?: (lessonId: number) => void;
}

export function CourseDetailsForm({ courseData, courseId, onBack, onLessonClick }: CourseDetailsFormProps) {
  return (
    <motion.div
      key={`details-${courseId}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Breadcrumb onBack={onBack} />
      <HeroSection course={courseData} />
      <ContinueLearningCard course={courseData} />
      <CurriculumSection lessons={courseData.lessons} onLessonClick={onLessonClick} />
      <DescriptionSection course={courseData} />
      <InstructorSection course={courseData} />
      <div style={{ height: 24 }} />
    </motion.div>
  );
}
