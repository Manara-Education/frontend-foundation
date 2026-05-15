import { LessonPlayerForm } from "../components/lesson-player-form";
import { useLessonPlayer } from "../hooks/use-lesson-player";

export interface LessonPlayerPageProps {
  courseId: number;
  lessonId: number;
  onBackToCourseDetails: () => void;
  onBackToCourses: () => void;
  onBackToHome: () => void;
  onLessonChange?: (lessonId: number) => void;
}

export function LessonPlayerPage({
  courseId,
  lessonId,
  onBackToCourseDetails,
  onBackToCourses,
  onBackToHome,
  onLessonChange,
}: LessonPlayerPageProps) {
  const {
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
    navigateToLesson,
    markComplete,
  } = useLessonPlayer({ courseId, lessonId, onLessonChange });

  return (
    <LessonPlayerForm
      isLoading={isLoading}
      course={course}
      currentLesson={currentLesson}
      currentLessonId={currentLessonId}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
      isMarkedComplete={isMarkedComplete}
      completedCount={completedCount}
      progress={progress}
      lessonContent={lessonContent}
      videoId={videoId}
      onBackToCourseDetails={onBackToCourseDetails}
      onBackToCourses={onBackToCourses}
      onBackToHome={onBackToHome}
      onNavigateToLesson={navigateToLesson}
      onMarkComplete={markComplete}
    />
  );
}
