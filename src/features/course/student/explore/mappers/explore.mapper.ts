import { normalizeCourseAccessType } from "@/shared/courses";
import type { CourseExploreDto, CourseExploreView } from "../types/explore.types";

export function toExploreView(dto: CourseExploreDto): CourseExploreView {
  const purchasePrice = dto.purchasePrice ?? dto.price ?? null;

  return {
    id: dto.id,
    title: dto.title,
    subtitle: dto.subtitle ?? "",
    image: dto.image ?? "",
    description: dto.description ?? "",
    duration: dto.duration ?? 0,
    lessonCount: dto.lessonCount ?? 0,
    price: purchasePrice ?? 0,
    purchasePrice,
    accessType: normalizeCourseAccessType(dto.accessType),
    studentsCount: dto.studentsCount ?? 0,
    instructorId: dto.instructorId,
    instructorName: dto.instructorName ?? "",
    createdAt: dto.createdAt,
  };
}
