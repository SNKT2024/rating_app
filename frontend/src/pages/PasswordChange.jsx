import React, { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { privateApi } from "../api/axios"; // Use privateApi for authenticated requests
import { useAuth } from "../context/AuthContext"; // To get user info (optional, but good practice)
import { FaLock, FaKey, FaSyncAlt } from "react-icons/fa"; // Icons

const ChangePasswordPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirm new password do not match.");
      setLoading(false);
      return;
    }

    if (oldPassword === newPassword) {
      setError("New password cannot be the same as the old password.");
      setLoading(false);
      return;
    }

    try {
      // Your backend endpoint is POST /api/auth/update-password
      // It expects oldPassword and newPassword in the body.
      // The user ID is taken from the JWT token on the backend.
      const response = await privateApi.post("/auth/update-password", {
        oldPassword,
        newPassword,
      });
      setSuccess(response.data.message || "Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error(
        "Error changing password:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          "Failed to update password. Please check your old password."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading Auth...</span>
        </Spinner>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger" className="shadow-sm">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p className="mb-0">You must be logged in to change your password.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <div className="w-100" style={{ maxWidth: "500px" }}>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h2 className="text-center mb-4 text-primary">
              <FaKey className="me-2" />
              Change Password
            </h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="oldPassword" className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group id="newPassword" className="mb-3">
                <Form.Label>New Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="8-16 chars, incl. uppercase & special"
                    required
                    disabled={loading}
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Password must be 8-16 characters, include at least one
                  uppercase letter and one special character.
                </Form.Text>
              </Form.Group>

              <Form.Group id="confirmNewPassword" className="mb-4">
                <Form.Label>Confirm New Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </InputGroup>
              </Form.Group>

              <Button
                disabled={loading}
                className="w-100"
                type="submit"
                variant="primary"
              >
                {loading ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FaSyncAlt className="me-2" />
                )}
                {loading ? "Changing Password..." : "Change Password"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default ChangePasswordPage;
