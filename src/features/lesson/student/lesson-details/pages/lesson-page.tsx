import { AnimatePresence, motion } from "motion/react";
import { LessonForm } from "../components/lesson-form";
import { LessonSkeleton } from "../components/lesson-skeleton";
import { FONT, LP_SHIMMER } from "../components/lesson.constants";
import { useLesson } from "../hooks/use-lesson";

export interface LessonPageProps {
  courseId: number;
  lessonId: number;
  onBackToCourseDetails: () => void;
  onBackToCourses: () => void;
  onBackToHome: () => void;
  onLessonChange?: (lessonId: number) => void;
}

export function LessonPage({
  courseId,
  lessonId,
  onBackToCourseDetails,
  onBackToCourses,
  onBackToHome,
  onLessonChange,
}: LessonPageProps) {
  const {
    isLoading,
    currentLesson,
    course,
    prevLesson,
    nextLesson,
    isMarkedComplete,
    isLocked,
    isQuizRequired,
    completionError,
    description,
    videoUrl,
    navigateToLesson,
    markComplete,
  } = useLesson({ courseId, lessonId, onLessonChange });

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      {/* The skeleton's shimmer and the two-column layout both live in this sheet. */}
      <style>{LP_SHIMMER}</style>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LessonSkeleton />
          </motion.div>
        ) : !currentLesson ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9BA3C4" }}>
            حدث خطأ أثناء تحميل الدرس
          </div>
        ) : (
          <LessonForm
            courseId={courseId}
            currentLesson={currentLesson}
            course={course}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            isMarkedComplete={isMarkedComplete}
            isLocked={isLocked}
            isQuizRequired={isQuizRequired}
            completionError={completionError}
            description={description}
            videoUrl={videoUrl}
            onBackToCourseDetails={onBackToCourseDetails}
            onBackToCourses={onBackToCourses}
            onBackToHome={onBackToHome}
            onNavigateToLesson={navigateToLesson}
            onMarkComplete={markComplete}
            onQuizPassed={markComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
