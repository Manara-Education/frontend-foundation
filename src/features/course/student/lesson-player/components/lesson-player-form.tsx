import { AnimatePresence, motion } from "motion/react";
import type {
  CourseForPlayer,
  LessonContent,
  LessonView,
} from "../types/lesson-player.types";
import { CourseCompletionBanner } from "./course-completion-banner";
import { CurriculumSidePanel } from "./curriculum-side-panel";
import { LessonContentSection } from "./lesson-content-section";
import { LessonHeaderCard } from "./lesson-header-card";
import { LessonNavigation } from "./lesson-navigation";
import { LessonPlayerSkeleton } from "./lesson-player-skeleton";
import { FONT, LP_SHIMMER } from "./lesson-player.constants";
import { LPBreadcrumb } from "./lp-breadcrumb";
import { YouTubePlayer } from "./youtube-player";

interface LessonPlayerFormProps {
  isLoading: boolean;
  course: CourseForPlayer | null;
  currentLesson: LessonView | null;
  currentLessonId: number;
  prevLesson: LessonView | null;
  nextLesson: LessonView | null;
  isMarkedComplete: boolean;
  completedCount: number;
  progress: number;
  lessonContent: LessonContent;
  videoId: string;
  onBackToCourseDetails: () => void;
  onBackToCourses: () => void;
  onBackToHome: () => void;
  onNavigateToLesson: (lessonId: number) => void;
  onMarkComplete: () => void;
}

export function LessonPlayerForm({
  isLoading,
  course,
  currentLesson,
  currentLessonId,
  prevLesson,
  nextLesson,
  isMarkedComplete,
  completedCount,
  progress,
  lessonContent,
  videoId,
  onBackToCourseDetails,
  onBackToCourses,
  onBackToHome,
  onNavigateToLesson,
  onMarkComplete,
}: LessonPlayerFormProps) {
  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      <style>{LP_SHIMMER}</style>

      <AnimatePresence mode="wait">
        {isLoading || !course || !currentLesson ? (
          <motion.div
            key="lp-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LessonPlayerSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key={`lesson-${currentLessonId}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Breadcrumb */}
            <LPBreadcrumb
              onHome={onBackToHome}
              onCourses={onBackToCourses}
              onCourseDetails={onBackToCourseDetails}
              lessonTitle={currentLesson.title}
            />

            {/* Two-column layout */}
            <div className="lp-two-col">
              {/* ── RIGHT COLUMN: Curriculum Panel ── */}
              <div className="lp-curriculum-col">
                <CurriculumSidePanel
                  lessons={course.lessons}
                  currentLessonId={currentLessonId}
                  onLessonSelect={onNavigateToLesson}
                />
              </div>

              {/* ── LEFT COLUMN: Main Content ── */}
              <div className="lp-main-col">
                {/* Completion banner */}
                {isMarkedComplete && <CourseCompletionBanner courseTitle={course.title} />}

                {/* Lesson header */}
                <LessonHeaderCard
                  lesson={currentLesson}
                  course={course}
                  completedCount={completedCount}
                  isMarkedComplete={isMarkedComplete}
                  progress={progress}
                />

                {/* YouTube player */}
                <YouTubePlayer
                  videoId={videoId}
                  lessonTitle={currentLesson.title}
                  onMarkComplete={onMarkComplete}
                  isMarked={isMarkedComplete}
                />

                {/* Lesson content */}
                <LessonContentSection content={lessonContent} />

                {/* Navigation */}
                <LessonNavigation
                  prevLesson={prevLesson}
                  nextLesson={nextLesson}
                  onNavigate={onNavigateToLesson}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
