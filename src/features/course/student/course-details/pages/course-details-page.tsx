import { motion, AnimatePresence } from "motion/react";
import { CourseDetailsForm } from "../components/course-details-form";
import { DetailSkeleton } from "../components/detail-skeleton";
import { useCourseDetails } from "../hooks/use-course-details";

const FONT = "'Cairo', sans-serif";

interface CourseDetailsPageProps {
  courseId: number;
  onBack: () => void;
  onLessonClick?: (lessonId: number) => void;
}

export function CourseDetailsPage({ courseId, onBack, onLessonClick }: CourseDetailsPageProps) {
  const { isLoading, courseData } = useCourseDetails(courseId);

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
          <div style={{ textAlign: "center", padding: 40, color: "#9BA3C4" }}>حدث خطأ أثناء تحميل الدورة</div>
        ) : (
          <CourseDetailsForm
            courseData={courseData}
            courseId={courseId}
            onBack={onBack}
            onLessonClick={onLessonClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
