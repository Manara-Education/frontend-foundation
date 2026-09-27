import { useEffect, useState } from "react";
import { getCourseCategoriesRequest, type CourseCategoryResponse } from "../api/course-editor.api";

export type CategoriesState =
  | { status: "loading" }
  | { status: "ready"; categories: readonly CourseCategoryResponse[] }
  | { status: "error" };

/** The categories offered in the course editor. A failure leaves the rest of the editor usable. */
export function useCourseCategories(): CategoriesState {
  const [state, setState] = useState<CategoriesState>({ status: "loading" });
  useEffect(() => {
    let cancelled = false;
    getCourseCategoriesRequest()
      .then(({ data: body }) => {
        if (!cancelled) setState({ status: "ready", categories: Array.isArray(body.data) ? body.data : [] });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}
