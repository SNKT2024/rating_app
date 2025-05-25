import React, { useState } from "react";
import {
  Form,
  Button,
  Alert,
  Spinner,
  Card,
  InputGroup,
} from "react-bootstrap";
import { privateApi } from "../../api/axios";
import {
  FaUserPlus,
  FaEnvelope,
  FaLock,
  FaMapMarkerAlt,
  FaUserTie,
} from "react-icons/fa";

const CreateUserForm = ({ onUserCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "normal_user",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await privateApi.post("/admin/users", formData);
      setSuccess(response.data.message || "User created successfully!");

      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "normal_user",
        });
        if (onUserCreated) {
          onUserCreated();
        }
      }, 1000);
    } catch (err) {
      console.error("Error creating user:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Failed to create user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-light border-0 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-primary">
          <FaUserPlus className="me-2" />
          Add New User
        </h5>
        {onCancel && (
          <Button variant="outline-secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}{" "}
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
                placeholder="Enter user's full name"
                required
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
                placeholder="Enter user's email"
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FaLock />
              </InputGroup.Text>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (8-16 chars, incl. uppercase & special)"
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address (Optional)</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FaMapMarkerAlt />
              </InputGroup.Text>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter user's address"
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
              >
                <option value="normal_user">Normal User</option>
                <option value="store_owner">Store Owner</option>
                <option value="system_admin">System Administrator</option>
              </Form.Select>
            </InputGroup>
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <FaUserPlus className="me-2" />
            )}
            {loading ? "Creating User..." : "Create User"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreateUserForm;
