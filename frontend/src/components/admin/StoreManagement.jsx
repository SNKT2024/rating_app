import React, { useState } from "react";
import {
  Table,
  Form,
  InputGroup,
  Badge,
  Button,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Collapse,
} from "react-bootstrap";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaStore,
  FaStar,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import CreateStoreForm from "./CreateStoreForm";
import EditStoreModal from "./EditStoreModal";
import { privateApi } from "../../api/axios";

const StoreManagement = ({
  stores,
  loading,
  error,
  filterTerms,
  handleFilterChange,
  clearFilters,
  requestSort,
  getSortIcon,
  onStoreListRefresh,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const getRatingStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;

    return (
      <div className="d-flex align-items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={
              i < fullStars
                ? "text-warning"
                : i === fullStars && hasHalfStar
                ? "text-warning opacity-50"
                : "text-muted"
            }
            size="0.8em"
          />
        ))}
        <span className="ms-1 small text-muted">({numRating.toFixed(1)})</span>
      </div>
    );
  };

  const handleStoreCreated = () => {
    setShowCreateForm(false);
    if (onStoreListRefresh) {
      onStoreListRefresh();
    }
  };

  const handleEditClick = (storeId) => {
    setSelectedStoreId(storeId);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (storeId, storeName) => {
    if (
      window.confirm(
        `Are you sure you want to delete store "${storeName}" (ID: ${storeId})? This action cannot be undone.`
      )
    ) {
      try {
        await privateApi.delete(`/admin/stores/${storeId}`);
        alert("Store deleted successfully!");
        if (onStoreListRefresh) {
          onStoreListRefresh();
        }
      } catch (err) {
        console.error(
          "Error deleting store:",
          err.response?.data || err.message
        );
        alert(
          `Failed to delete store: ${
            err.response?.data?.message || err.message
          }`
        );
      }
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedStoreId(null);
  };

  const handleStoreUpdated = () => {
    handleCloseEditModal();
    if (onStoreListRefresh) {
      onStoreListRefresh();
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 text-success">
          <FaStore className="me-2" />
          Store Management
        </h4>
        <div>
          <Badge bg="success" className="fs-6 me-2">
            {stores.length} stores
          </Badge>
          <Button
            variant="success"
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <FaPlus className="me-1" />{" "}
            {showCreateForm ? "Hide Form" : "Add New"}
          </Button>
        </div>
      </div>

      {/* Collapsible Create Store Form */}
      <Collapse in={showCreateForm}>
        <div className="mb-4">
          <CreateStoreForm
            onStoreCreated={handleStoreCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </Collapse>

      {/* Edit Store Modal */}
      <EditStoreModal
        show={showEditModal}
        onHide={handleCloseEditModal}
        storeId={selectedStoreId}
        onStoreUpdated={handleStoreUpdated}
      />

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" variant="success" />
          <span className="ms-2">Loading stores...</span>
        </div>
      ) : error ? (
        <Alert variant="danger" className="shadow-sm">
          {error}
        </Alert>
      ) : (
        <>
          {/* Store Filters Card */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Filter Stores</h6>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col lg={4} md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by store name..."
                      name="name"
                      value={filterTerms.name}
                      onChange={handleFilterChange}
                    />
                  </InputGroup>
                </Col>
                <Col lg={4} md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Filter by email..."
                    name="email"
                    value={filterTerms.email}
                    onChange={handleFilterChange}
                  />
                </Col>
                <Col lg={4} md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Filter by address..."
                    name="address"
                    value={filterTerms.address}
                    onChange={handleFilterChange}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Stores Table */}
          <Card className="shadow-sm border-0 mb-5">
            <div className="table-responsive">
              <Table className="mb-0 table-hover">
                <thead className="table-light">
                  <tr>
                    <th
                      onClick={() => requestSort("id")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      ID {getSortIcon("id")}
                    </th>
                    <th
                      onClick={() => requestSort("name")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Store Name {getSortIcon("name")}
                    </th>
                    <th
                      onClick={() => requestSort("email")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Email {getSortIcon("email")}
                    </th>
                    <th
                      onClick={() => requestSort("address")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Address {getSortIcon("address")}
                    </th>
                    <th
                      onClick={() => requestSort("averageRating")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Rating {getSortIcon("averageRating")}
                    </th>
                    <th className="border-0">Actions</th>{" "}
                  </tr>
                </thead>
                <tbody>
                  {stores.length > 0 ? (
                    stores.map((store) => (
                      <tr key={store.id}>
                        <td className="align-middle">
                          <Badge bg="light" text="dark">
                            #{store.id}
                          </Badge>
                        </td>
                        <td className="align-middle fw-medium">{store.name}</td>
                        <td className="align-middle text-muted">
                          {store.email || (
                            <span className="text-muted fst-italic">
                              No email
                            </span>
                          )}
                        </td>
                        <td className="align-middle">
                          {store.address ? (
                            <span
                              className="text-truncate d-inline-block"
                              style={{ maxWidth: "200px" }}
                              title={store.address}
                            >
                              {store.address}
                            </span>
                          ) : (
                            <span className="text-muted fst-italic">
                              No address
                            </span>
                          )}
                        </td>
                        <td className="align-middle">
                          {getRatingStars(store.averageRating)}
                        </td>

                        <td className="align-middle">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditClick(store.id)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleDeleteClick(store.id, store.name)
                            }
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        <FaStore size="3em" className="mb-3 opacity-25" />
                        <br />
                        No stores found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default StoreManagement;
