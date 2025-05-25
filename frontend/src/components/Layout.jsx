import React from "react";
import { Container, Navbar, Nav, Badge, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated, isAdmin, isStoreOwner, isNormalUser } =
    useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold">
            🏪 Store Ratings
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isAuthenticated && user && (
                <>
                  {isAdmin && (
                    <Nav.Link
                      as={Link}
                      to="/admin-dashboard"
                      className="fw-semibold"
                    >
                      Admin Dashboard
                    </Nav.Link>
                  )}
                  {isStoreOwner && (
                    <Nav.Link
                      as={Link}
                      to="/store-owner-dashboard"
                      className="fw-semibold"
                    >
                      My Store
                    </Nav.Link>
                  )}
                  {isNormalUser && (
                    <Nav.Link as={Link} to="/stores" className="fw-semibold">
                      Browse Stores
                    </Nav.Link>
                  )}
                  <Nav.Link as={Link} to="/change-password">
                    Change Password
                  </Nav.Link>
                </>
              )}
            </Nav>
            <Nav>
              {isAuthenticated ? (
                <>
                  <Navbar.Text className="me-3 mt-2">
                    Hey there, <strong>{user.name}!</strong>
                    <Badge bg="light" text="dark" className="ms-2">
                      {user.role}
                    </Badge>
                  </Navbar.Text>
                  <Nav.Link
                    onClick={handleLogout}
                    className="text-warning fw-semibold"
                  >
                    <Button variant="outline-danger">Logout</Button>
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="fw-semibold">
                    Login
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/signup"
                    className="fw-semibold text-warning"
                  >
                    Join Us
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="py-3">{children}</Container>
    </>
  );
};

export default Layout;
