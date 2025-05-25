import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.warn(
      `User ${user.email} (role: ${user.role}) attempted to access a restricted route.`
    );
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
