"use client";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Convenience hook to access auth context.
 * Usage: const { login, logout, backendUser, loading } = useAuth();
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuth;
