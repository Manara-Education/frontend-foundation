import type { AxiosResponse } from "axios";
import { ApiError, type ApiResponse } from "./api.types";

/**
 * Opens the backend's `ApiResponse<T>` envelope.
 *
 * Every endpoint answers `{ status, data?, errors? }`, so callers used to repeat
 * `response.data.data!` and silently trusted the non-null assertion. This turns a
 * missing payload into the project's normal `ApiError` instead, so a malformed
 * success envelope surfaces the same way a 4xx does.
 */
export function unwrap<T>(response: AxiosResponse<ApiResponse<T>>): T {
  const body = response.data;

  if (body?.status === "error" || body?.data === undefined || body?.data === null) {
    throw new ApiError(response.status, body?.errors ?? ["Unexpected empty response"], body?.code);
  }

  return body.data;
}

/**
 * Same as {@link unwrap} for list endpoints, where an absent payload means
 * "nothing to show" rather than a broken response.
 */
export function unwrapList<T>(response: AxiosResponse<ApiResponse<T[]>>): T[] {
  const body = response.data;

  if (body?.status === "error") {
    throw new ApiError(response.status, body.errors ?? ["Unexpected error response"], body.code);
  }

  return body?.data ?? [];
}
