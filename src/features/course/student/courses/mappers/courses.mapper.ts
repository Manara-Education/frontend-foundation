import type { Course, CourseView, Status } from "../types/courses.types";

function deriveStatus(progress: number): Status {
  if (progress >= 100) return "completed";
  if (progress <= 0) return "not-started";
  return "in-progress";
}

export function toCourseView(dto: Course): CourseView {
  const total = dto.lessonCount ?? 0;
  // Backend currently doesn't ship completedLessons / progress on the list DTO.
  const completed = 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    id: dto.id,
    title: dto.title,
    instructor: dto.instructorName ?? "",
    description: dto.description ?? "",
    image: dto.image ?? "",
    progress,
    totalLessons: total,
    completedLessons: completed,
    status: deriveStatus(progress),
    category: dto.subtitle ?? "",
    duration: dto.duration ? `${dto.duration} ساعة` : "",
  };
}
