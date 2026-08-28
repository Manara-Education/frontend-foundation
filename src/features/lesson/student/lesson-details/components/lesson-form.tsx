import { motion } from "motion/react";
import type { LessonContentType } from "@/shared/courses";
import type { RichDocument } from "@/shared/rich-content";
import type { VideoSource } from "@/shared/video";
import { QuizPlayer } from "@/features/quiz/student/quiz-player";
import type { LessonCourseSummary, LessonRef, LessonView } from "../types/lesson.types";
import { CompletionErrorNotice } from "./completion-error-notice";
import { LessonCompleteButton } from "./lesson-complete-button";
import { LessonCompletionBanner } from "./lesson-completion-banner";
import { LessonContentSection } from "./lesson-content-section";
import { LessonHeaderCard } from "./lesson-header-card";
import { LessonLockedCard } from "./lesson-locked-card";
import { LessonNavigation } from "./lesson-navigation";
import { LessonRichContentSection } from "./lesson-rich-content-section";
import { LPBreadcrumb } from "./lp-breadcrumb";
import { QuizRequiredNotice } from "./quiz-required-notice";
import { VideoPlayer } from "./video-player";

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
  contentType: LessonContentType;
  video: VideoSource | null;
  richContent: RichDocument;
  isCompleting: boolean;
  canMarkComplete: boolean;
  onMarkComplete: () => void;
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
  contentType,
  video,
  richContent,
  isCompleting,
  canMarkComplete,
  onMarkComplete,
  onBackToCourseDetails,
  onBackToCourses,
  onBackToHome,
  onNavigateToLesson,
  onVideoEnd,
  onQuizPassed,
}: LessonFormProps) {
  const isRichContent = contentType === "RICH_CONTENT";
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
          {/*
            The content-type branch, and the whole reason it is a branch rather than a conditional
            inside the player: a rich-content lesson does not render a player in any state. Not an
            empty one, not a placeholder, not a disabled one — the component is simply not here, so
            there is nothing on the page for a learner to mistake for a video that failed to load.
          */}
          {isRichContent ? (
            <LessonRichContentSection document={richContent} />
          ) : (
            <VideoPlayer
              source={video}
              lessonTitle={currentLesson.title}
              onVideoEnd={onVideoEnd}
              isMarked={isMarkedComplete}
              quizRequired={isQuizRequired}
            />
          )}

          {isQuizRequired && <QuizRequiredNotice />}
          {completionError && <CompletionErrorNotice message={completionError} />}

          {/*
            Below the player the lesson reads in two columns: its content and quiz in the
            wide one, the lesson rail beside it. `.lp-two-col` folds them back into one
            column at the narrow breakpoint.
          */}
          <div className="lp-two-col">
            <div className="lp-main-col">
              {/*
                The short blurb beside the lesson, which is a different thing from the lesson body
                and stays a different thing. A rich-content lesson whose author wrote no summary
                would otherwise show an empty card under the article they did write.
              */}
              {(!isRichContent || description.trim() !== "") && (
                <LessonContentSection description={description} />
              )}

              {/*
                Manara's completion control, for the lesson type that has no playback to end. A
                video lesson does not get one: its video completes it, and offering both would be
                two ways to record the same thing.
              */}
              {isRichContent && (
                <LessonCompleteButton
                  isCompleted={isMarkedComplete}
                  isCompleting={isCompleting}
                  canComplete={canMarkComplete}
                  isQuizRequired={isQuizRequired}
                  onComplete={onMarkComplete}
                />
              )}

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
