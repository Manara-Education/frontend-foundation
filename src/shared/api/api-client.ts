import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { ApiError, type ApiErrorPayload } from "./api.types";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json", "Accept-Language": "ar" },
  timeout: 15_000,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

let csrfBootstrap: (() => Promise<void>) | null = null;
let onUnauthenticated: (() => void) | null = null;

export function registerCsrfBootstrap(fn: () => Promise<void>) {
  csrfBootstrap = fn;
}

export function registerUnauthenticatedHandler(fn: () => void) {
  onUnauthenticated = fn;
}

type RetriableConfig = AxiosRequestConfig & { _csrfRetried?: boolean };

async function handleResponseError(error: AxiosError<ApiErrorPayload>) {
  if (!error.response) {
    throw new ApiError(0, [error.message || "Network error"]);
  }

  const { status, data, config } = error.response;

  if (status === 403 && csrfBootstrap && config && !(config as RetriableConfig)._csrfRetried) {
    (config as RetriableConfig)._csrfRetried = true;
    try {
      await csrfBootstrap();
      return apiClient.request(config);
    } catch {
      throw new ApiError(status, data?.errors ?? [error.message]);
    }
  }

  if (status === 401) {
    onUnauthenticated?.();
  }

  throw new ApiError(status, data?.errors ?? [error.message]);
}

apiClient.interceptors.response.use((r) => r, handleResponseError);
