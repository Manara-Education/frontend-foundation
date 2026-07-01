import type { CourseExploreDto, CourseExploreView } from "../types/explore.types";

export function toExploreView(dto: CourseExploreDto): CourseExploreView {
  return {
    id: dto.id,
    title: dto.title,
    subtitle: dto.subtitle ?? "",
    image: dto.image ?? "",
    description: dto.description ?? "",
    duration: dto.duration ?? 0,
    lessonCount: dto.lessonCount ?? 0,
    price: dto.price ?? 0,
    studentsCount: dto.studentsCount ?? 0,
    instructorId: dto.instructorId,
    instructorName: dto.instructorName ?? "",
    createdAt: dto.createdAt,
  };
}
