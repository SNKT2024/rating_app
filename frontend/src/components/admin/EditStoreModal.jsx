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
  FaStore,
  FaEdit,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserTie,
} from "react-icons/fa";

const EditStoreModal = ({ show, onHide, storeId, onStoreUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "", // Can be null or an existing store owner ID
  });
  const [loadingData, setLoadingData] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [storeOwners, setStoreOwners] = useState([]); // State to hold possible store owners for dropdown
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [errorOwners, setErrorOwners] = useState("");

  // Fetch store data when modal is shown or storeId changes
  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeId) {
        setFormData({ name: "", email: "", address: "", owner_id: "" });
        setLoadingData(false);
        return;
      }

      setLoadingData(true);
      setError("");
      setSuccess("");
      try {
        const response = await privateApi.get(`/admin/stores/${storeId}`);
        const storeData = response.data;
        setFormData({
          name: storeData.name,
          email: storeData.email,
          address: storeData.address || "",
          owner_id: storeData.owner_id || "", // Pre-fill owner_id, use empty string if null
        });
      } catch (err) {
        console.error(
          "Error fetching store data for edit:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.message || "Failed to load store data.");
      } finally {
        setLoadingData(false);
      }
    };

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
        setErrorOwners("Failed to load store owners for selection.");
      } finally {
        setLoadingOwners(false);
      }
    };

    if (show) {
      // Only fetch data and owners when modal is actually shown
      fetchStoreData();
      fetchStoreOwners();
    }
  }, [show, storeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    setError("");
    setSuccess("");

    // Prepare data to send: owner_id should be null if empty string
    const dataToUpdate = {
      name: formData.name,
      email: formData.email,
      address: formData.address === "" ? null : formData.address,
      owner_id:
        formData.owner_id === "" ? null : parseInt(formData.owner_id, 10),
    };

    try {
      const response = await privateApi.put(
        `/admin/stores/${storeId}`,
        dataToUpdate
      );
      setSuccess(response.data.message || "Store updated successfully!");

      setTimeout(() => {
        if (onStoreUpdated) {
          onStoreUpdated(); // Notify parent to refresh list and close modal
        }
      }, 1500); // Keep success message visible for 1.5 seconds
    } catch (err) {
      console.error("Error updating store:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Failed to update store. Please try again."
      );
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaEdit className="me-2" />
          Edit Store: {formData.name || "Loading..."}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingData ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />{" "}
            <p className="mt-2">Loading store data...</p>
          </div>
        ) : error && !success ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            {success && <Alert variant="success">{success}</Alert>}
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
                    placeholder="Enter store email"
                    required
                    disabled={loadingUpdate}
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
                    disabled={loadingUpdate}
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
                    disabled={loadingUpdate || loadingOwners}
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
                    No store owner users found. Create one first via "Add New
                    User" form.
                  </Form.Text>
                )}
              </Form.Group>

              {error && <Alert variant="danger">{error}</Alert>}

              <Button variant="primary" type="submit" disabled={loadingUpdate}>
                {loadingUpdate ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FaEdit className="me-2" />
                )}
                {loadingUpdate ? "Updating Store..." : "Update Store"}
              </Button>
            </Form>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default EditStoreModal;
