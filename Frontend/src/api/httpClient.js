import { getStoredCredentials } from "../services/authStorage.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function buildHeaders(options = {}) {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const credentials = options.credentialsOverride || getStoredCredentials();
  if (credentials?.username && credentials?.password) {
    headers.set("Authorization", `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`);
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

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      data?.message ||
      (response.status === 401 ? "Invalid username or password." : "Request failed.");

    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}
