import React from "react";
import { Container, Card, Spinner, Button } from "react-bootstrap"; // Import Button
import { Link } from "react-router-dom"; // Import Link for navigation
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
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" size="sm" className="me-2" /> Loading user
        data...
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="text-center my-5">
        <p>Please log in to view the dashboard.</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="mb-3">Welcome, {user?.name || user?.email}!</h2>
          <p className="mb-4">
            Your Role: <strong>{user?.role?.toUpperCase()}</strong>
          </p>

          {isAdmin && (
            <div className="mb-3">
              <h5>Administrator Dashboard</h5>
              <p>Access and manage all system settings and users.</p>
              <Button
                as={Link}
                to="/admin-dashboard"
                variant="primary"
                size="sm"
              >
                Go to Admin Dashboard
              </Button>
            </div>
          )}

          {isStoreOwner && (
            <div className="mb-3">
              <h5>Store Owner Dashboard</h5>
              <p>Manage your store's inventory, orders, and details.</p>
              <Button
                as={Link}
                to="/store-owner-dashboard"
                variant="primary"
                size="sm"
              >
                Go to My Store Dashboard
              </Button>
            </div>
          )}

          {isNormalUser && (
            <div className="mb-3">
              <h5>Normal User Dashboard</h5>
              <p>View your profile, past orders, and explore stores.</p>
              <Button as={Link} to="/stores" variant="primary" size="sm">
                Explore Stores
              </Button>
              <br />
              <br />
              <Button
                as={Link}
                to="/change-password"
                variant="primary"
                size="sm"
              >
                Change Password
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;
