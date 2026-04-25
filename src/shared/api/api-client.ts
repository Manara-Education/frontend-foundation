import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ApiError, type ApiErrorPayload } from "./api.types";

const TOKEN_KEY = "auth_token";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json", "Accept-Language": "ar" },
  timeout: 15_000,
});

function injectToken(config: InternalAxiosRequestConfig) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

function handleResponseError(error: AxiosError<ApiErrorPayload>) {
  if (error.response) {
    const { status, data } = error.response;

    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/";
    }

    throw new ApiError(status, data?.errors ?? [error.message]);
  }

  throw new ApiError(0, [error.message || "Network error"]);
}

apiClient.interceptors.request.use(injectToken);
apiClient.interceptors.response.use((r) => r, handleResponseError);
