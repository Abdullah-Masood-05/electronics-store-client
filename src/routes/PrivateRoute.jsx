import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Spin } from "antd";
import useAuth from "../hooks/useAuth";

/**
 * PrivateRoute component.
 * Checks loading state, Firebase user, and backend user.
 * - If loading → show spinner
 * - If not authenticated → redirect to /login
 * - If authenticated → render child routes
 */
const PrivateRoute = () => {
    const { loading, isAuthenticated } = useAuth();

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

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
