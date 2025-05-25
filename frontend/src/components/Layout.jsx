import React from "react";
import { Container, Navbar, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth(); // Added isAdmin
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Store Rating App
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isAuthenticated && user && (
                <>
                  {isAdmin && (
                    <Nav.Link as={Link} to="/admin-dashboard">
                      Admin Dashboard
                    </Nav.Link>
                  )}

                  {user.role === "store_owner" && (
                    <Nav.Link as={Link} to="/store-owner-dashboard">
                      My Store Dashboard
                    </Nav.Link>
                  )}
                  {user.role === "normal_user" && (
                    <Nav.Link as={Link} to="/stores">
                      View Stores
                    </Nav.Link>
                  )}
                </>
              )}
            </Nav>
            <Nav>
              {isAuthenticated ? (
                <>
                  <Navbar.Text className="me-3">
                    Signed in as:{" "}
                    <strong style={{ color: "white" }}>
                      {user.email} ({user.role})
                    </strong>
                  </Navbar.Text>
                  <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">
                    Login
                  </Nav.Link>
                  <Nav.Link as={Link} to="/signup">
                    Signup
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container>{children}</Container>
    </>
  );
};

export default Layout;
