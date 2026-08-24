import { motion, AnimatePresence } from "motion/react";
import { CourseDetailsForm } from "../components/course-details-form";
import { DetailSkeleton } from "../components/detail-skeleton";
import { FONT } from "../formatters/course-details.formatter";
import { useCourseDetails } from "../hooks/use-course-details";
import type { CourseDetailsMode } from "../types/course-details.types";

interface CourseDetailsPageProps {
  courseId: number;
  /** Back to the list this course was opened from. */
  onBack: () => void;
  /** The learner's home, for the first breadcrumb. Falls back to `onBack`. */
  onHome?: () => void;
  onLessonClick?: (lessonId: number) => void;
  mode?: CourseDetailsMode;
  onEnrolled?: () => void;
}

export function CourseDetailsPage({
  courseId,
  onBack,
  onHome,
  onLessonClick,
  mode = "enrolled",
  onEnrolled,
}: CourseDetailsPageProps) {
  const { isLoading, courseData, error, handleEnrolled, refreshProgression } =
    useCourseDetails({ courseId, mode, onEnrolled });

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DetailSkeleton />
          </motion.div>
        ) : !courseData ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9BA3C4" }}>
            حدث خطأ أثناء تحميل الدورة
          </div>
        ) : (
          <CourseDetailsForm
            courseData={courseData}
            courseId={courseId}
            mode={mode}
            onBack={onBack}
            onHome={onHome}
            onLessonClick={onLessonClick}
            onEnrolled={handleEnrolled}
            onProgressionChanged={refreshProgression}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
