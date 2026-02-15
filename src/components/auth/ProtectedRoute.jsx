import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, redirectTo = "/login" }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        Checking session...
      </div>
    );
  }

  if (!user) return <Navigate to={redirectTo} replace />;

  return children;
}
