import { ApiError, unwrap } from "@/shared/api";
import { getPublicCourseRequest, getPublicCoursesRequest } from "../api/public-courses.api";
import { toPublicCourseDetail, toPublicCoursePage } from "../mappers/public-courses.mapper";
import type { PublicCourseDetail, PublicCoursePage } from "../types/public-courses.types";
import { PublicCourseError } from "./public-course.error";

/** The page size the landing section asks for. */
export const PUBLIC_COURSES_PAGE_SIZE = 12;

/** The largest page the backend serves. */
export const PUBLIC_COURSES_MAX_PAGE_SIZE = 50;

/**
 * A course id exactly as the catalogue writes it, or `null`.
 *
 * The backend answers any other spelling (`0x2a`, `042`, `+42`) with a 400, and a URL a person
 * typed or mangled is a page that does not exist — so it is recognised here, without a request.
 */
export function toCourseId(value: string | number): number | null {
  const text = String(value);
  if (!/^[1-9]\d{0,15}$/.test(text)) return null;
  const id = Number(text);
  return Number.isSafeInteger(id) ? id : null;
}

/**
 * One page of courses anyone may see.
 *
 * A 404 here is not "no courses": the list route always exists once deployed, so a 404 means
 * this frontend is talking to a backend that does not have it yet — a server failure, not an
 * empty catalogue.
 */
export async function getPublicCourses(
  page = 0,
  size = PUBLIC_COURSES_PAGE_SIZE,
): Promise<PublicCoursePage> {
  if (!Number.isSafeInteger(page) || page < 0 || !Number.isSafeInteger(size) || size < 1 || size > PUBLIC_COURSES_MAX_PAGE_SIZE) {
    throw new RangeError(`Invalid public course page request: page=${page}, size=${size}`);
  }
  try {
    return toPublicCoursePage(unwrap(await getPublicCoursesRequest({ page, size })));
  } catch (error) {
    const classified = classify(error);
    throw classified.kind === "not-found" ? new PublicCourseError("server") : classified;
  }
}

/**
 * One course anyone may see. A course that is not (or no longer) on offer — draft, private,
 * removed, or an id that never existed — is `not-found`; the backend does not say which.
 */
export async function getPublicCourse(courseId: string | number): Promise<PublicCourseDetail> {
  const id = toCourseId(courseId);
  if (id === null) throw new PublicCourseError("not-found");
  try {
    return toPublicCourseDetail(unwrap(await getPublicCourseRequest(id)));
  } catch (error) {
    throw classify(error);
  }
}

function classify(error: unknown): PublicCourseError {
  if (error instanceof PublicCourseError) return error;
  if (error instanceof ApiError) {
    if (error.statusCode === 0) return new PublicCourseError("network");
    if (error.statusCode === 404) return new PublicCourseError("not-found");
    if (error.statusCode === 429) return new PublicCourseError("rate-limited");
    // `unwrap` reports an empty or error-shaped success envelope with its 2xx status.
    if (error.statusCode >= 200 && error.statusCode < 300) return new PublicCourseError("malformed");
    return new PublicCourseError("server");
  }
  return new PublicCourseError("malformed");
}
