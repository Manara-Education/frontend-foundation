import { motion } from "motion/react";
import { QuizPlayer } from "@/features/quiz/student/quiz-player";
import type { LessonCourseSummary, LessonRef, LessonView } from "../types/lesson.types";
import { CompletionErrorNotice } from "./completion-error-notice";
import { LessonCompletionBanner } from "./lesson-completion-banner";
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
  course: LessonCourseSummary | null;
  prevLesson: LessonRef | null;
  nextLesson: LessonRef | null;
  isNextLessonLocked: boolean;
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
  onVideoEnd: () => void;
  onQuizPassed: () => void;
}

export function LessonForm({
  courseId,
  currentLesson,
  course,
  prevLesson,
  nextLesson,
  isNextLessonLocked,
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
  onVideoEnd,
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

      {/*
        The lesson's own completion, announced above the header the moment the server
        agrees the lesson is done. It reads the same state the header's chip does.
      */}
      {isMarkedComplete && <LessonCompletionBanner courseTitle={course?.title ?? null} />}

      <LessonHeaderCard
        lesson={currentLesson}
        course={course}
        isMarkedComplete={isMarkedComplete}
      />

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
            onVideoEnd={onVideoEnd}
            isMarked={isMarkedComplete}
            quizRequired={isQuizRequired}
          />

          {isQuizRequired && <QuizRequiredNotice />}
          {completionError && <CompletionErrorNotice message={completionError} />}

          {/*
            Below the player the lesson reads in two columns: its content and quiz in the
            wide one, the lesson rail beside it. `.lp-two-col` folds them back into one
            column at the narrow breakpoint.
          */}
          <div className="lp-two-col">
            <div className="lp-main-col">
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
            </div>

            {/*
              The first and last lesson of a course have nowhere to go, and the rail is
              left out entirely for them rather than reserving its width for nothing.
            */}
            {(prevLesson || nextLesson) && (
              <div className="lp-curriculum-col">
                <LessonNavigation
                  prevLesson={prevLesson}
                  nextLesson={nextLesson}
                  isNextLessonLocked={isNextLessonLocked}
                  onNavigate={onNavigateToLesson}
                />
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
