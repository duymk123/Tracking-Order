import {
  getAccessToken,
  getRefreshToken,
  saveAuthData,
  clearAuthData,
} from "../services/authStorage.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

let isRefreshing = false;
let refreshPromise = null;

function buildHeaders(options = {}) {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Use Bearer token from storage unless explicitly overridden
  const token = options.tokenOverride || getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

/**
 * Thực hiện làm mới token khi Access Token hết hạn (5 phút)
 */
async function performRefreshToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearAuthData();
    throw new Error("Session expired. Please log in again.");
  }

  const data = await response.json();
  saveAuthData({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
    features: data.features,
  });

  return data.accessToken;
}

/**
 * API Request Wrapper hỗ trợ tự động đính kèm JWT Bearer Token
 * và tự động refresh token + re-evaluate feature flags khi hết hạn session.
 */
export async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  let response = await fetch(url, {
    ...options,
    headers: buildHeaders(options),
  });

  // Nếu gặp lỗi 401 Unauthorized (và không phải đang gọi API login/refresh)
  if (response.status === 401 && !path.startsWith("/api/v1/auth/")) {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = performRefreshToken().finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
        }

        const newAccessToken = await refreshPromise;

        // Thử lại request ban đầu với token mới
        const retryHeaders = new Headers(options.headers);
        if (!retryHeaders.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
          retryHeaders.set("Content-Type", "application/json");
        }
        retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

        response = await fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      } catch (refreshError) {
        clearAuthData();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        throw refreshError;
      }
    } else {
      clearAuthData();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      data?.message ||
      (response.status === 401 ? "Tài khoản hoặc phiên làm việc không hợp lệ." : "Yêu cầu thất bại.");

    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}
