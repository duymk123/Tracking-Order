const AUTH_STORAGE_KEY = "tracking-order.basic-auth";
const PROFILE_STORAGE_KEY = "tracking-order.profile";

export function getStoredCredentials() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCredentials(credentials) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(credentials));
}

export function clearCredentials() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(PROFILE_STORAGE_KEY);
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
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
