import axios from "axios";
import { env } from "@/shared/config/env";
import { notifyUnauthorized } from "@/shared/http/unauthorized";

export const apiClient = axios.create({
  baseURL: env.apiUrl || undefined,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;
    const url = axios.isAxiosError(error)
      ? String(error.config?.url ?? "")
      : "";
    const isPublicAuth =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/register") ||
      url.includes("/api/auth/verify") ||
      url.includes("/api/profile");
      
    const isPublicPage = ["/login", "/cadastro", "/verificar", "/cardapio"].some((path) =>
      window.location.pathname.startsWith(path),
    );

    if (status === 401 && !isPublicAuth && !isPublicPage) {
      notifyUnauthorized();
    }

    return Promise.reject(error);
  },
);
