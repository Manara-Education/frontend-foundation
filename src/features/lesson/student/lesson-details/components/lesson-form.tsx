import { motion } from "motion/react";
import { QuizPlayer } from "@/features/quiz/student/quiz-player";
import type { LessonRef, LessonView } from "../types/lesson.types";
import { CompletionErrorNotice } from "./completion-error-notice";
import { LessonContentSection } from "./lesson-content-section";
import { LessonHeaderCard } from "./lesson-header-card";
import { LessonLockedCard } from "./lesson-locked-card";
import { LessonNavigation } from "./lesson-navigation";
import { LPBreadcrumb } from "./lp-breadcrumb";
import { QuizRequiredNotice } from "./quiz-required-notice";
import { YouTubePlayer } from "./youtube-player";

interface LessonFormProps {
  courseId: number;
  currentLesson: LessonView;
  prevLesson: LessonRef | null;
  nextLesson: LessonRef | null;
  isMarkedComplete: boolean;
  isLocked: boolean;
  isQuizRequired: boolean;
  completionError: string | null;
  description: string;
  videoUrl: string;
  onBackToCourseDetails: () => void;
  onBackToCourses: () => void;
  onBackToHome: () => void;
  onNavigateToLesson: (lessonId: number) => void;
  onMarkComplete: () => void;
  onQuizPassed: () => void;
}

export function LessonForm({
  courseId,
  currentLesson,
  prevLesson,
  nextLesson,
  isMarkedComplete,
  isLocked,
  isQuizRequired,
  completionError,
  description,
  videoUrl,
  onBackToCourseDetails,
  onBackToCourses,
  onBackToHome,
  onNavigateToLesson,
  onMarkComplete,
  onQuizPassed,
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

      {/*
        A locked lesson still answers with its title and position, so the header stays
        and the content it withheld is replaced by the lock rather than an empty player.
      */}
      {isLocked ? (
        <LessonLockedCard />
      ) : (
        <>
          <YouTubePlayer
            videoUrl={videoUrl}
            lessonTitle={currentLesson.title}
            onMarkComplete={onMarkComplete}
            isMarked={isMarkedComplete}
            quizRequired={isQuizRequired}
          />

          {isQuizRequired && <QuizRequiredNotice />}
          {completionError && <CompletionErrorNotice message={completionError} />}

          <LessonContentSection description={description} />

          {currentLesson.quiz && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              style={{ marginBottom: 16 }}
            >
              <QuizPlayer
                courseId={courseId}
                quiz={currentLesson.quiz}
                kind="LESSON"
                onPassAction={onQuizPassed}
                isPassActionPending={false}
              />
            </motion.div>
          )}

          <LessonNavigation
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            onNavigate={onNavigateToLesson}
          />
        </>
      )}
    </motion.div>
  );
}
