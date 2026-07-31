import { useMemo, useState } from "react";
import { clearCredentials, getStoredProfile } from "../services/authStorage.js";

export function useAuth() {
  const [profile, setProfile] = useState(() => getStoredProfile());

  return useMemo(
    () => ({
      profile,
      isAuthenticated: Boolean(profile),
      setProfile,
      signOut() {
        clearCredentials();
        setProfile(null);
      },
    }),
    [profile]
  );
}
