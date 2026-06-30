import { motion } from "motion/react";
import type { LessonRef, LessonView } from "../types/lesson.types";
import { LessonContentSection } from "./lesson-content-section";
import { LessonHeaderCard } from "./lesson-header-card";
import { LessonNavigation } from "./lesson-navigation";
import { LPBreadcrumb } from "./lp-breadcrumb";
import { YouTubePlayer } from "./youtube-player";

interface LessonFormProps {
  currentLesson: LessonView;
  prevLesson: LessonRef | null;
  nextLesson: LessonRef | null;
  isMarkedComplete: boolean;
  description: string;
  videoUrl: string;
  onBackToCourseDetails: () => void;
  onBackToCourses: () => void;
  onBackToHome: () => void;
  onNavigateToLesson: (lessonId: number) => void;
  onMarkComplete: () => void;
}

export function LessonForm({
  currentLesson,
  prevLesson,
  nextLesson,
  isMarkedComplete,
  description,
  videoUrl,
  onBackToCourseDetails,
  onBackToCourses,
  onBackToHome,
  onNavigateToLesson,
  onMarkComplete,
}: LessonFormProps) {
  return (
    <motion.div
      key={`lesson-${currentLesson.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <LPBreadcrumb
        onHome={onBackToHome}
        onCourses={onBackToCourses}
        onCourseDetails={onBackToCourseDetails}
        lessonTitle={currentLesson.title}
      />

      <LessonHeaderCard lesson={currentLesson} isMarkedComplete={isMarkedComplete} />

      <YouTubePlayer
        videoUrl={videoUrl}
        lessonTitle={currentLesson.title}
        onMarkComplete={onMarkComplete}
        isMarked={isMarkedComplete}
      />

      <LessonContentSection description={description} />

      <LessonNavigation
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        onNavigate={onNavigateToLesson}
      />
    </motion.div>
  );
}
