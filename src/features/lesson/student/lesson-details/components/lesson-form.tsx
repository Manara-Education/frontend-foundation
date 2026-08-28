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

  /*
    The two pieces that belong to the lesson rather than to either layout, lifted out so the
    branch below places them instead of restating them. Both are about the lesson's own state —
    a quiz standing between the learner and completion, and a claim the server refused — and
    both belong in whichever column the lesson turns out to have.
  */
  const notices = (
    <>
      {isQuizRequired && <QuizRequiredNotice />}
      {completionError && <CompletionErrorNotice message={completionError} />}
    </>
  );

  const lessonQuiz = currentLesson.quiz ? (
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
  ) : null;

  /*
    The page's own width, and the reason it is decided here rather than by the route.

    The lesson route asks the shell for its full width because a video lesson spreads a player
    and a rail across it, and the route cannot know which kind of lesson it is about to load —
    only the loaded lesson knows that. So the page takes its width back at the point the answer
    exists: a lesson that is read gets the reading grid, and a video lesson gets no modifier and
    keeps precisely the layout it had.
  */
  const pageClassName = isRichContent ? "lp-page lp-page--reading" : "lp-page";

  return (
    <motion.div
      key={`lesson-${currentLesson.id}`}
      className={pageClassName}
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
      ) : isRichContent ? (
        /*
          ── A lesson that is read ──────────────────────────────────────────────────────────

          One column, inset inside the page grid the header above it uses: the article, then
          the things that follow an article — anything blocking completion, the lesson's own
          summary if its author wrote one, its quiz, and the row that ends it.

          No rail. The rail exists to fill the space beside a video, and beside a column of
          text there is no such space to fill — putting one there is what turned a page of
          reading into a narrow strip of text in a very wide card.
        */
        <div className="lp-reading-surface">
          <LessonRichContentSection document={richContent} />

          {notices}

          {/*
            The short blurb beside the lesson, which is a different thing from the lesson body
            and stays a different thing. A rich-content lesson whose author wrote no summary
            would otherwise show an empty card under the article they did write.
          */}
          {description.trim() !== "" && <LessonContentSection description={description} />}

          {lessonQuiz}

          {/*
            Previous, complete, next — one row, and the only place any of the three appears.
            Manara's completion control is handed to the navigation rather than drawn again
            beside it, so there is exactly one control on the page that can complete a lesson.
          */}
          <LessonNavigation
            layout="footer"
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            isNextLessonLocked={isNextLessonLocked}
            onNavigate={onNavigateToLesson}
            action={
              <LessonCompleteButton
                isCompleted={isMarkedComplete}
                isCompleting={isCompleting}
                canComplete={canMarkComplete}
                isQuizRequired={isQuizRequired}
                onComplete={onMarkComplete}
              />
            }
          />
        </div>
      ) : (
        /*
          ── A lesson that is watched ───────────────────────────────────────────────────────

          Unchanged. The player, then the lesson's content and quiz in the wide column with
          the lesson rail beside it; `.lp-two-col` folds them back into one column at the
          narrow breakpoint. A video lesson has no completion control: its video completes it,
          and offering both would be two ways to record the same thing.
        */
        <>
          <VideoPlayer
            source={video}
            lessonTitle={currentLesson.title}
            onVideoEnd={onVideoEnd}
            isMarked={isMarkedComplete}
            quizRequired={isQuizRequired}
          />

          {notices}

          <div className="lp-two-col">
            <div className="lp-main-col">
              <LessonContentSection description={description} />
              {lessonQuiz}
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
