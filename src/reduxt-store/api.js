import axios from "axios";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "";

// In development, route through Vite so browser CORS policy does not block API calls.
export const API_BASE_URL = import.meta.env.DEV ? "" : configuredApiBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const publicRoutes = ["/auth/login", "/auth/signup"];

api.interceptors.request.use((config) => {
  const isPublic = publicRoutes.some((route) => config.url?.startsWith(route));

  if (!isPublic) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// Turns any backend / network error into a readable message.
// Backend errors come back as { message, error, status } (GlobalExceptionHandler)
// or Spring's default { error, message, path }.
export function getErrorMessage(err, fallback = "Something went wrong") {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (err?.code === "ERR_NETWORK")
    return configuredApiBaseUrl
      ? `Cannot reach the JobNova server at ${configuredApiBaseUrl}. Check the API Gateway and its CORS settings.`
      : "Cannot reach the JobNova API through this site. Check that the API Gateway is running.";
  return fallback;
}

export default api;
