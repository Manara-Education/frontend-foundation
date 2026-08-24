import type { CourseView, CourseViewDto } from "../types/courses.types";

export function toCourseView(dto: CourseViewDto): CourseView {
  return {
    id: dto.id,
    title: dto.title,
    instructor: dto.instructor,
    description: dto.description,
    image: dto.image,
    progress: dto.progress,
    totalLessons: dto.totalLessons,
    completedLessons: dto.completedLessons,
    status: dto.status,
    category: dto.category,
    duration: dto.duration,
  };
}
