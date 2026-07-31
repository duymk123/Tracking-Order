import { apiRequest } from "../api/httpClient.js";
import { saveCredentials, saveProfile } from "./authStorage.js";

export async function signIn({ username, password }) {
  const profile = await apiRequest("/api/v1/users/me", {
    method: "GET",
    credentialsOverride: { username, password },
  });

  saveCredentials({ username, password });
  saveProfile(profile);
  return profile;
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
