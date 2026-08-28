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
    // Per enrolment, from the server. A backend that predates the field sends nothing, and
    // "nothing" must read as "no updates" — a badge on every course would be worse than a
    // badge on none.
    hasUpdatesSinceEnrollment: dto.hasUpdatesSinceEnrollment === true,
  };
}
