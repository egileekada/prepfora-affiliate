import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import URLS from "./urls";

const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  "https://prepforabackend-production.up.railway.app";

// ─── Token Storage ────────────────────────────────────────────────────────────

const ACCESS_TOKEN_KEY = "prepfora_access_token";
const REFRESH_TOKEN_KEY = "prepfora_refresh_token";

let inMemoryAccessToken: string | null = null;

export const tokenStorage = {
  getAccess: (): string | null => {
    if (inMemoryAccessToken) return inMemoryAccessToken;
    if (typeof window !== "undefined") {
      inMemoryAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return inMemoryAccessToken;
  },
  setAccess: (token: string | null | undefined) => {
    inMemoryAccessToken = token ?? null;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    }
  },
  clearAccess: () => {
    inMemoryAccessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },

  getRefresh: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefresh: (token: string | null | undefined) => {
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
  clearRefresh: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  clearAll: () => {
    inMemoryAccessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
};

/** Clears tokens and client session keys. Safe to call from UI or interceptors. */
export function clearSession() {
  tokenStorage.clearAll();
  if (typeof window === "undefined") return;
  localStorage.removeItem("prepfora_user");
  localStorage.removeItem("prepforauserid");
  localStorage.removeItem("prepforauserrole");
}

/** Navigates to the login page if not already there, clearing session. */
export function redirectToAuth() {
  clearSession();
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    if (currentPath !== "/login" && currentPath !== "/verify") {
      window.location.href = "/login";
    }
  }
}

/**
 * Checks if a JWT token is expired (with a 10s safety buffer).
 * Returns true if token is missing or expired, false if valid or not a JWT.
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (typeof payload.exp !== "number") return false;
    // 10-second buffer before actual expiration
    return Date.now() >= payload.exp * 1000 - 10_000;
  } catch {
    return false;
  }
}

/**
 * Checks whether an error response indicates that the token is invalid or expired.
 * Handles 401, 403, and 500 error messages from the backend (e.g., "Invalid or expired token").
 */
export function isAuthExpiredError(error: AxiosError<unknown>): boolean {
  const status = error.response?.status;
  if (status === 401) return true;

  const data = error.response?.data as Record<string, unknown> | string | undefined;
  let rawMsg = "";
  if (typeof data === "string") {
    rawMsg = data;
  } else if (data && typeof data === "object") {
    rawMsg = String(data.message || data.detail || data.error || "");
  } else {
    rawMsg = error.message || "";
  }

  const msg = rawMsg.toLowerCase();

  return (
    msg.includes("invalid or expired token") ||
    msg.includes("expired token") ||
    msg.includes("token has expired") ||
    msg.includes("token is expired") ||
    msg.includes("could not validate credentials") ||
    msg.includes("not authenticated") ||
    msg.includes("signature has expired") ||
    msg.includes("jwt expired")
  );
}

// ─── Axios Instances ──────────────────────────────────────────────────────────

export const httpService = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
});

export const unsecureHttpService = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
});

// ─── Refresh Token Logic ──────────────────────────────────────────────────────

let refreshPromise: Promise<string> | null = null;

interface RefreshApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    access_token?: string;
    refresh_token?: string;
    tokens?: {
      access_token?: string;
      refresh_token?: string;
    };
  };
  access_token?: string;
  refresh_token?: string;
  tokens?: {
    access_token?: string;
    refresh_token?: string;
  };
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) throw new Error("No refresh token available");

    // Use the unsecure instance so this call never triggers another refresh loop
    const response = await unsecureHttpService.post<RefreshApiResponse>(
      URLS.REFRESH_TOKEN || "/auth/refresh-token",
      { refresh_token: refreshToken }
    );

    const res = response.data;
    const newAccessToken =
      res?.data?.access_token ||
      res?.data?.tokens?.access_token ||
      res?.access_token ||
      res?.tokens?.access_token;

    const newRefreshToken =
      res?.data?.refresh_token ||
      res?.data?.tokens?.refresh_token ||
      res?.refresh_token ||
      res?.tokens?.refresh_token;

    if (!newAccessToken) {
      throw new Error("No access token received from refresh endpoint");
    }

    tokenStorage.setAccess(newAccessToken);
    if (newRefreshToken) {
      tokenStorage.setRefresh(newRefreshToken);
    }

    return newAccessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// ─── Unsecured Instance Interceptors ─────────────────────────────────────────

unsecureHttpService.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError<unknown>): Promise<never> => Promise.reject(error)
);

// ─── Helper for Setting Authorization Header ──────────────────────────────────

function setAuthHeader(config: InternalAxiosRequestConfig, token: string) {
  if (config.headers?.set) {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else if (config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
}

// ─── Secured Instance — Request Interceptor ───────────────────────────────────

httpService.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    let token = tokenStorage.getAccess();

    // Proactive check: if access token is present and expired, try refreshing before request
    if (token && isTokenExpired(token)) {
      const refreshToken = tokenStorage.getRefresh();
      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          token = await refreshAccessToken();
        } catch {
          redirectToAuth();
          return Promise.reject(new Error("Token expired and refresh failed"));
        }
      } else {
        redirectToAuth();
        return Promise.reject(new Error("Session expired"));
      }
    }

    if (token) {
      setAuthHeader(config, token);
    }
    return config;
  },
  (error: AxiosError<unknown>): Promise<never> => Promise.reject(error)
);

// ─── Secured Instance — Response Interceptor (handles 401 / expired token + refresh) ─────────

httpService.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // If backend returns 200 with success: false and token expired message
    const data = response.data as Record<string, unknown> | undefined;
    if (data && data.success === false) {
      const msg = String(data.message || data.detail || "").toLowerCase();
      if (
        msg.includes("invalid or expired token") ||
        msg.includes("expired token") ||
        msg.includes("token has expired") ||
        msg.includes("could not validate credentials")
      ) {
        redirectToAuth();
      }
    }
    return response;
  },

  async (error: AxiosError<unknown>): Promise<AxiosResponse> => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isExpired = isAuthExpiredError(error);

    // If it's not an authentication/token expiration error, reject normally
    if (!isExpired) {
      return Promise.reject(error);
    }

    // If request already retried and failed again, or has no config, navigate to auth
    if (!originalRequest || originalRequest._retry) {
      redirectToAuth();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();
      setAuthHeader(originalRequest, newToken);
      return httpService(originalRequest); // retry original request
    } catch (refreshError) {
      redirectToAuth();
      return Promise.reject(refreshError);
    }
  }
);

export default httpService;