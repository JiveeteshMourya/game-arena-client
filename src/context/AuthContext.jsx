import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { API_URL } from "../utils/constants";

const AuthContext = createContext(null);
const STORAGE_KEY = "gauth_user";
const hasStorage = typeof window !== "undefined" && "localStorage" in window;

const baseUrl = `${API_URL.replace(/\/+$/, "")}/auth`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    if (!hasStorage) {
      setInitializing(false);
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setInitializing(false);
    }
  }, []);

  const persistUser = useCallback(payload => {
    setUser(payload);
    if (hasStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        /* ignore storage quota/availability errors */
      }
    }
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
    if (hasStorage) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const extractUser = data => data?.data?.user || data?.user || data?.data;

  const parseResponse = async res => {
    let body = {};
    try {
      body = await res.json();
    } catch {
      body = {};
    }
    return body;
  };

  const handleAuthResponse = (res, data, fallbackMessage) => {
    if (!res.ok) {
      const message =
        data?.message ||
        (res.status === 401
          ? "Invalid credentials"
          : res.status === 403
            ? "Not authorized"
            : fallbackMessage);
      throw new Error(message);
    }
  };

  const authFetch = useCallback(
    async (url, options = {}) => {
      try {
        const res = await fetch(url, {
          credentials: "include",
          ...options,
        });
        if (res.status === 401 || res.status === 403) {
          clearUser();
        }
        return res;
      } catch (err) {
        // Normalize network errors so callers can show a friendly message
        throw new Error(err?.message || "Network request failed");
      }
    },
    [clearUser]
  );

  const login = useCallback(
    async (email, password) => {
      setAuthBusy(true);
      try {
        const res = await authFetch(`${baseUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await parseResponse(res);
        handleAuthResponse(res, data, "Login failed");

        const userData = extractUser(data);
        if (!userData) throw new Error("User data missing from response");

        persistUser(userData);
        return userData;
      } finally {
        setAuthBusy(false);
      }
    },
    [authFetch, persistUser]
  );

  const signup = useCallback(
    async payload => {
      setAuthBusy(true);
      try {
        const res = await authFetch(`${baseUrl}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await parseResponse(res);
        handleAuthResponse(res, data, "Signup failed");

        const userData = extractUser(data);
        if (!userData) throw new Error("User data missing from response");

        persistUser(userData);
        return userData;
      } finally {
        setAuthBusy(false);
      }
    },
    [authFetch, persistUser]
  );

  const logout = useCallback(async () => {
    setAuthBusy(true);
    try {
      await authFetch(`${baseUrl}/logout`, {
        method: "POST",
      });
    } finally {
      clearUser();
      setAuthBusy(false);
    }
  }, [authFetch, clearUser]);

  const value = useMemo(
    () => ({
      user,
      initializing,
      authBusy,
      login,
      signup,
      logout,
      setUser: persistUser,
      authFetch,
    }),
    [user, initializing, authBusy, login, signup, logout, authFetch, persistUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
