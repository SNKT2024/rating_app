import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { privateApi } from "../../api/axios";
import {
  FaUserEdit,
  FaEnvelope,
  FaLock,
  FaMapMarkerAlt,
  FaUserTie,
} from "react-icons/fa";

const EditUserModal = ({ show, onHide, userId, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "",
  });
  const [loadingData, setLoadingData] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setFormData({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "",
        });
        setLoadingData(false);
        return;
      }

      setLoadingData(true);
      setError("");
      setSuccess(""); // Clear any previous success message when opening for a new user
      try {
        const response = await privateApi.get(`/admin/users/${userId}`);
        const userData = response.data;
        setFormData({
          name: userData.name,
          email: userData.email,
          password: "",
          address: userData.address || "",
          role: userData.role,
        });
      } catch (err) {
        console.error(
          "Error fetching user data for edit:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.message || "Failed to load user data.");
      } finally {
        setLoadingData(false);
      }
    };

    if (show) {
      fetchUserData();
    }
  }, [show, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    setError("");
    setSuccess(""); // Clear previous success on new submission attempt

    const dataToUpdate = {
      name: formData.name,
      email: formData.email,
      address: formData.address === "" ? null : formData.address,
      role: formData.role,
    };
    if (formData.password) {
      dataToUpdate.password = formData.password;
    }

    try {
      const response = await privateApi.put(
        `/admin/users/${userId}`,
        dataToUpdate
      );
      setSuccess(response.data.message || "User updated successfully!");

      // --- FIX START: Delay modal close and parent notification ---
      setTimeout(() => {
        if (onUserUpdated) {
          onUserUpdated(); // Notify parent to refresh list and close modal
        }
        // No need for onHide() here if onUserUpdated also triggers onHide from parent.
        // If onUserUpdated only refreshes the list, then:
        // onHide(); // Close modal after delay
      }, 1500); // Keep success message visible for 1.5 seconds
      // --- FIX END ---
    } catch (err) {
      console.error("Error updating user:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Failed to update user. Please try again."
      );
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaUserEdit className="me-2" />
          Edit User: {formData.name || "Loading..."}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingData ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />{" "}
            <p className="mt-2">Loading user data...</p>
          </div>
        ) : error && !success ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            {success && <Alert variant="success">{success}</Alert>}{" "}
            {/* This will now stay longer */}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaUserTie />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="User's full name"
                    required
                    disabled={loadingUpdate}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaEnvelope />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="User's email"
                    required
                    disabled={loadingUpdate}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  New Password (Leave blank to keep current)
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password (8-16 chars, incl. uppercase & special)"
                    disabled={loadingUpdate}
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Only enter if you want to change the password.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaMapMarkerAlt />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="User's address"
                    disabled={loadingUpdate}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Role</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaUserTie />
                  </InputGroup.Text>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    disabled={loadingUpdate}
                  >
                    <option value="normal_user">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                    <option value="system_admin">System Administrator</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>

              {error && <Alert variant="danger">{error}</Alert>}

              <Button variant="primary" type="submit" disabled={loadingUpdate}>
                {loadingUpdate ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FaUserEdit className="me-2" />
                )}
                {loadingUpdate ? "Updating User..." : "Update User"}
              </Button>
            </Form>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default EditUserModal;
