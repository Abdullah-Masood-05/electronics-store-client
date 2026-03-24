"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin, message } from "antd";
import useAuth from "../hooks/useAuth";

/**
 * AdminGuard component.
 * Wraps admin-only pages. Redirects non-admin users to home.
 * Must be used inside AuthProvider.
 */
const AdminGuard = ({ children }) => {
  const { loading, isAuthenticated, backendUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (backendUser?.role !== "admin") {
        message.error("Admin access only");
        router.replace("/");
      }
    }
  }, [loading, isAuthenticated, backendUser, router]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "var(--bg-primary, #0a0e1a)",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || backendUser?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
};

export default AdminGuard;
