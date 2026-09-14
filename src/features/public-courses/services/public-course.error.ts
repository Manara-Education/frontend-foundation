import type { PublicCourseFailure } from "../types/public-courses.types";

/**
 * Everything that can go wrong reading the public catalogue, already classified.
 *
 * `not-found` is its own kind rather than a failure: it is a normal answer — a course that is
 * not (or no longer) on offer — and the page shows it as such, while the failures offer a retry.
 */
export class PublicCourseError extends Error {
  constructor(public readonly kind: PublicCourseFailure | "not-found") {
    super(`Public course request failed: ${kind}`);
    this.name = "PublicCourseError";
  }
}
