/**
 * "All my courses" renders the shared course card model. `Course` stays as the local
 * name so the existing components keep compiling unchanged.
 */
export type { CourseCardModel as Course } from "@/shared/courses";

/**
 * Status segment the instructor can narrow the list down to.
 *
 * Lower case and local on purpose: it is a view concern, not the wire enum. The
 * backend `CourseStatus` it maps onto stays in `@/shared/courses`.
 */
export type CourseStatusFilter = "all" | "published" | "draft";

/**
 * Course totals per segment, always counted over the whole collection rather than the
 * search results, so the pills keep answering "how many courses do I have" while the
 * search narrows what is on screen.
 */
export interface CourseStatusCounts {
  all: number;
  published: number;
  draft: number;
}
