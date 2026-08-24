/**
 * Explore lists published courses straight from the student browse endpoint, so the
 * DTO is the canonical `CourseResponse`.
 */
export type { CourseResponse as CourseExploreDto } from "@/shared/courses";

import type { CourseAccessType, CourseStatus, CourseStructure } from "@/shared/courses";

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
   * @deprecated Kept only for callers that predate the access model. The card reads
   * `accessType` and `purchasePrice` — a `0` here means "free **or** subscription".
   */
  price: number;
  /** The one-off price, and `null` for every course that is not bought outright. */
  purchasePrice: number | null;
  accessType: CourseAccessType;
  /** Shape of the course's content tree, as the backend reports it. */
  structure: CourseStructure;
  /** Publication state. The browse endpoint only lists `PUBLISHED` courses. */
  status: CourseStatus;
  studentsCount: number;
  instructorId: number;
  instructorName: string;
  createdAt: string;
}
