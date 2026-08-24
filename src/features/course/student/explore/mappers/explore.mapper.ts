import {
  normalizeCourseAccessType,
  normalizeCourseStatus,
  normalizeCourseStructure,
} from "@/shared/courses";
import type { CourseExploreDto, CourseExploreView } from "../types/explore.types";

/**
 * `price` is the former name of `purchasePrice` and is `null` for free *and*
 * subscription courses, so it cannot tell them apart. `accessType` is what the card
 * branches on; `purchasePrice` only ever carries an amount for `PURCHASE`.
 */
export function toExploreView(dto: CourseExploreDto): CourseExploreView {
  const accessType = normalizeCourseAccessType(dto.accessType);
  const purchasePrice = accessType === "PURCHASE" ? dto.purchasePrice ?? dto.price ?? null : null;

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
    accessType,
    structure: normalizeCourseStructure(dto.structure),
    status: normalizeCourseStatus(dto.status),
    studentsCount: dto.studentsCount ?? 0,
    instructorId: dto.instructorId,
    instructorName: dto.instructorName ?? "",
    createdAt: dto.createdAt,
  };
}
