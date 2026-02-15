import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "gauth_user";

const rawBase = import.meta.env.VITE_AUTH_BASE_URL || "/api/v1/auth";
const trimmedBase = rawBase.replace(/\/+$/, "");
const baseUrl = trimmedBase.endsWith("/auth") ? trimmedBase : `${trimmedBase}/auth`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setInitializing(false);
  }, []);

  const persistUser = payload => {
    setUser(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const extractUser = data => data?.data?.user || data?.user || data?.data;

  const parseResponse = async res => {
    let body = {};
    try {
      body = await res.json();
    } catch (err) {
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

  const login = useCallback(async (email, password) => {
    setAuthBusy(true);
    try {
      const res = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
  }, []);

  const signup = useCallback(async payload => {
    setAuthBusy(true);
    try {
      const res = await fetch(`${baseUrl}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
  }, []);

  const logout = useCallback(async () => {
    setAuthBusy(true);
    try {
      await fetch(`${baseUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      clearUser();
      setAuthBusy(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      authBusy,
      login,
      signup,
      logout,
      setUser: persistUser,
    }),
    [user, initializing, authBusy, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
