/**
 * Explore lists published courses straight from the student browse endpoint, so the
 * DTO is the canonical `CourseResponse`.
 */
export type { CourseResponse as CourseExploreDto } from "@/shared/courses";

import type { CourseAccessType } from "@/shared/courses";

export interface CourseExploreView {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  /** In minutes. */
  duration: number;
  lessonCount: number;
  /**
   * Display price, `0` when the course is not a one-off purchase.
   *
   * @deprecated Kept so the existing card renders unchanged. Read `accessType` and
   * `purchasePrice` for anything new — `0` here means "free **or** subscription".
   */
  price: number;
  purchasePrice: number | null;
  accessType: CourseAccessType;
  studentsCount: number;
  instructorId: number;
  instructorName: string;
  createdAt: string;
}
