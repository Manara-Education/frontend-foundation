import { useCallback, useEffect, useRef, useState } from "react";
import { PublicCourseError } from "../services/public-course.error";
import { getPublicCourse, getPublicCourses, PUBLIC_COURSES_PAGE_SIZE } from "../services/public-courses.service";
import type {
  PublicCourseDetailState,
  PublicCourseFailure,
  PublicCourseListState,
} from "../types/public-courses.types";

function failureOf(error: unknown): PublicCourseFailure {
  return error instanceof PublicCourseError && error.kind !== "not-found" ? error.kind : "server";
}

/**
 * Only the newest request may write. A retry, or a new page, can overtake a slow earlier request,
 * and the page must show the answer to the question it is asking now. Unmounting counts as a newer
 * question, so a response that lands after the page has gone is dropped.
 */
function useLatestRequest() {
  const latest = useRef(0);
  useEffect(() => () => void latest.current++, []);
  return latest;
}

export interface UsePublicCoursesResult {
  state: PublicCourseListState;
  retry: () => void;
}

/** One page of the public catalogue, with an honest empty state and a retry for failures. */
export function usePublicCourses(page = 0, size = PUBLIC_COURSES_PAGE_SIZE): UsePublicCoursesResult {
  const [state, setState] = useState<PublicCourseListState>({ status: "loading" });
  const latest = useLatestRequest();

  const load = useCallback(() => {
    const request = ++latest.current;
    setState({ status: "loading" });
    getPublicCourses(page, size)
      .then((result) => {
        if (request !== latest.current) return;
        setState(result.items.length === 0 ? { status: "empty", page: result } : { status: "ready", page: result });
      })
      .catch((error: unknown) => {
        if (request !== latest.current) return;
        setState({ status: "error", failure: failureOf(error) });
      });
  }, [latest, page, size]);

  useEffect(() => {
    load();
  }, [load]);

  return { state, retry: load };
}

export interface UsePublicCourseResult {
  state: PublicCourseDetailState;
  retry: () => void;
}

/**
 * One public course. `not-found` is a normal answer — the course is not on offer — and is kept
 * apart from failures, which are retryable.
 */
export function usePublicCourse(courseId: string | number | undefined): UsePublicCourseResult {
  const [state, setState] = useState<PublicCourseDetailState>({ status: "loading" });
  const latest = useLatestRequest();

  const load = useCallback(() => {
    const request = ++latest.current;
    if (courseId === undefined) {
      setState({ status: "not-found" });
      return;
    }
    setState({ status: "loading" });
    getPublicCourse(courseId)
      .then((course) => {
        if (request !== latest.current) return;
        setState({ status: "ready", course });
      })
      .catch((error: unknown) => {
        if (request !== latest.current) return;
        setState(
          error instanceof PublicCourseError && error.kind === "not-found"
            ? { status: "not-found" }
            : { status: "error", failure: failureOf(error) },
        );
      });
  }, [courseId, latest]);

  useEffect(() => {
    load();
  }, [load]);

  return { state, retry: load };
}
