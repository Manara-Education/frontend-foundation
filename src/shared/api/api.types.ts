/** Mirrors the backend's generic ApiResponse<T> wrapper */
export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  errors?: string[];
}

export interface MessageResponse {
  message: string;
}

export interface ApiErrorPayload {
  status: "error";
  errors: string[];
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errors: string[],
  ) {
    super(errors[0] ?? "Unknown error");
    this.name = "ApiError";
  }
}
