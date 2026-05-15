import { formatMinutesLabel, toLessonStatus } from "../formatters/lesson-player.formatter";
import type {
  Course,
  CourseForPlayer,
  Lesson,
  LessonView,
} from "../types/lesson-player.types";

export function toCourseForPlayer(course: Course, lessons: Lesson[]): CourseForPlayer {
  const sorted = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);
  const mappedLessons: LessonView[] = sorted.map((l) => ({
    id: l.id,
    number: l.orderIndex,
    title: l.title,
    duration: formatMinutesLabel(l.duration),
    status: toLessonStatus(l.isCompleted),
  }));

  const completed = mappedLessons.filter((l) => l.status === "completed").length;

  return {
    id: course.id,
    title: course.title,
    instructor: course.instructorName || "أستاذ متخصص",
    instructorTitle: "أستاذ في المجال",
    totalLessons: mappedLessons.length || course.lessonCount || 0,
    completedLessons: completed,
    lessons: mappedLessons,
  };
}
