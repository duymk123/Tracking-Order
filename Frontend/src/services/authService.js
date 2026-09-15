import { apiRequest } from "../api/httpClient.js";
import { saveAuthData, clearAuthData } from "./authStorage.js";

/**
 * Đăng nhập người dùng bằng JWT.
 * Gọi API POST /api/v1/auth/login, nhận Access Token, Refresh Token, User Profile & Features Snapshot.
 */
export async function signIn({ username, password }) {
  const authResponse = await apiRequest("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  saveAuthData({
    accessToken: authResponse.accessToken,
    refreshToken: authResponse.refreshToken,
    user: authResponse.user,
    features: authResponse.features,
  });

  return authResponse.user;
}

/**
 * Đăng xuất người dùng
 */
export function signOut() {
  clearAuthData();
}

export function getRoleHomePath(role) {
  switch (role) {
    case "SELLER":
      return "/seller/orders";
    case "SHIPPER":
      return "/shipper/orders";
    case "BUYER":
    default:
      return "/products";
  }
}
