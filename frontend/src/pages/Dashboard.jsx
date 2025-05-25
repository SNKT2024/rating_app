import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isStoreOwner,
    isNormalUser,
    loading,
  } = useAuth();

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view the dashboard.</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name || user?.email}!</h1>
      <p>
        Your Role: <strong>{user?.role}</strong>
      </p>

      {isAdmin && <p>This is the System Administrator Dashboard content.</p>}
      {isStoreOwner && <p>This is the Store Owner Dashboard content.</p>}
      {isNormalUser && <p>This is the Normal User Dashboard content.</p>}

      <p>Navigate using the links above based on your role.</p>
    </div>
  );
};

export default Dashboard;
