/** Mirrors the backend's generic ApiResponse<T> wrapper */
export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  errors?: string[];
  /** Machine-readable name of the condition behind an error, when it has one. */
  code?: string;
}

/**
 * The error codes a client is expected to recognise and act on.
 *
 * Branching on these rather than on `errors[0]` is the point of them: the message is localized
 * prose for whoever is looking at the screen, and matching on a translated sentence is not a
 * contract. Anything the backend sends that is not listed here is handled as an ordinary error.
 */
export const ApiErrorCode = {
  /** The save was built on a course revision the server has since moved past. Nothing was written. */
  COURSE_VERSION_CONFLICT: "COURSE_VERSION_CONFLICT",
  /** The save did not say which revision it was built from, so it could not be checked. */
  COURSE_REVISION_REQUIRED: "COURSE_REVISION_REQUIRED",
  /** A lesson was asked to be placed outside its sibling scope. */
  INVALID_LESSON_POSITION: "INVALID_LESSON_POSITION",
  /** The subscription plan is no longer offered; existing subscribers keep their term. */
  SUBSCRIPTION_PLAN_RETIRED: "SUBSCRIPTION_PLAN_RETIRED",
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export interface MessageResponse {
  message: string;
}

export interface ApiErrorPayload {
  status: "error";
  errors: string[];
  code?: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errors: string[],
    /** The backend's `ApiErrorCode` when it named one; `undefined` for an ordinary failure. */
    public code?: string,
  ) {
    super(errors[0] ?? "Unknown error");
    this.name = "ApiError";
  }

  /** Whether this is the named condition, whatever the status code and the message say. */
  is(code: ApiErrorCode): boolean {
    return this.code === code;
  }
}
