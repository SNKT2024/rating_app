import React, { useState, useEffect } from "react";
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
  FaPlus,
  FaStore,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserTie,
} from "react-icons/fa";

const CreateStoreForm = ({ onStoreCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [storeOwners, setStoreOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [errorOwners, setErrorOwners] = useState("");

  useEffect(() => {
    const fetchStoreOwners = async () => {
      try {
        setLoadingOwners(true);
        setErrorOwners("");
        const response = await privateApi.get("/admin/users?role=store_owner");
        setStoreOwners(response.data);
      } catch (err) {
        console.error(
          "Error fetching store owners:",
          err.response?.data || err.message
        );
        setErrorOwners("Failed to load store owners.");
      } finally {
        setLoadingOwners(false);
      }
    };
    fetchStoreOwners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const dataToSend = {
      ...formData,
      owner_id:
        formData.owner_id === "" ? null : parseInt(formData.owner_id, 10),
    };

    try {
      const response = await privateApi.post("/admin/stores", dataToSend);
      setSuccess(response.data.message || "Store created successfully!");

      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          address: "",
          owner_id: "",
        });
        if (onStoreCreated) {
          onStoreCreated();
        }
      }, 1000);
    } catch (err) {
      console.error("Error creating store:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Failed to create store. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-light border-0 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-success">
          <FaStore className="me-2" />
          Add New Store
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
        {/* This will now stay longer */}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Store Name</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FaStore />
              </InputGroup.Text>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter store name"
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
                placeholder="Enter store email"
                required
              />
            </InputGroup>
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
                placeholder="Enter store address"
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Store Owner (Optional)</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FaUserTie />
              </InputGroup.Text>
              <Form.Select
                name="owner_id"
                value={formData.owner_id}
                onChange={handleChange}
                disabled={loadingOwners}
              >
                <option value="">
                  {loadingOwners
                    ? "Loading owners..."
                    : "Select an owner (Optional)"}
                </option>
                {errorOwners && <option disabled>{errorOwners}</option>}
                {storeOwners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
            {storeOwners.length === 0 && !loadingOwners && !errorOwners && (
              <Form.Text className="text-muted">
                No store owner users found. Create one first via "Add New User"
                form.
              </Form.Text>
            )}
          </Form.Group>

          <Button variant="success" type="submit" disabled={loading}>
            {loading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <FaPlus className="me-2" />
            )}
            {loading ? "Creating Store..." : "Create Store"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreateStoreForm;
