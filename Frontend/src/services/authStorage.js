const ACCESS_TOKEN_KEY = "tracking-order.access-token";
const REFRESH_TOKEN_KEY = "tracking-order.refresh-token";
const PROFILE_STORAGE_KEY = "tracking-order.profile";
const FEATURES_STORAGE_KEY = "tracking-order.features";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || null;
}

export function saveAccessToken(token) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || null;
}

export function saveRefreshToken(token) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  if (profile) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  }
}

export function getStoredFeatures() {
  try {
    const raw = localStorage.getItem(FEATURES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveFeatures(features) {
  if (features) {
    localStorage.setItem(FEATURES_STORAGE_KEY, JSON.stringify(features));
    // Dispatch custom event so any listener component can react immediately
    window.dispatchEvent(new CustomEvent("features-updated", { detail: features }));
  } else {
    localStorage.removeItem(FEATURES_STORAGE_KEY);
  }
}

/**
 * Lưu toàn bộ dữ liệu xác thực & Feature Flags snapshot khi đăng nhập/làm mới token
 */
export function saveAuthData({ accessToken, refreshToken, user, features }) {
  if (accessToken) saveAccessToken(accessToken);
  if (refreshToken) saveRefreshToken(refreshToken);
  if (user) saveProfile(user);
  if (features) saveFeatures(features);
}

/**
 * Xóa toàn bộ dữ liệu đăng nhập
 */
export function clearAuthData() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(PROFILE_STORAGE_KEY);
  localStorage.removeItem(FEATURES_STORAGE_KEY);
}

// Backward compatibility alias for any existing code
export function getStoredCredentials() {
  const token = getAccessToken();
  const profile = getStoredProfile();
  if (token && profile) {
    return { token, username: profile.username };
  }
  return null;
}

export function clearCredentials() {
  clearAuthData();
}
