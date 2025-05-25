import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StoresList from "./pages/StoreList";
import ChangePasswordPage from "./pages/PasswordChange";
import StoreOwnerDashboard from "./components/store_owner/StoreOwnderDashboard"; // NEW: Import StoreOwnerDashboard
import ProtectedRoute from "./components/ProtectedRoutes";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes (requires authentication) */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />{" "}
        {/* General Dashboard */}
        {/* Admin Specific Protected Route */}
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute allowedRoles={["system_admin"]} />}
        >
          <Route
            index
            element={
              <Layout>
                <AdminDashboard />
              </Layout>
            }
          />
        </Route>
        {/* Normal User & Store Owner Stores List */}
        <Route
          path="/stores"
          element={
            <ProtectedRoute allowedRoles={["normal_user", "store_owner"]} />
          }
        >
          <Route
            index
            element={
              <Layout>
                <StoresList />
              </Layout>
            }
          />
        </Route>
        {/* Change Password Page */}
        <Route
          path="/change-password"
          element={
            <Layout>
              <ChangePasswordPage />
            </Layout>
          }
        />
        {/* Store Owner Specific Protected Route */}
        <Route
          path="/store-owner-dashboard"
          element={<ProtectedRoute allowedRoles={["store_owner"]} />}
        >
          <Route
            index
            element={
              <Layout>
                <StoreOwnerDashboard />
              </Layout>
            }
          />
        </Route>
      </Route>

      {/* redirects to login if not found */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
