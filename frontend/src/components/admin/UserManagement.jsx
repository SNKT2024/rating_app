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
  FaUsers,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import CreateUserForm from "./CreateUserForm";
import EditUserModal from "./EditUserModal";
import { privateApi } from "../../api/axios";

const UserManagement = ({
  users,
  loading,
  error,
  filterTerms,
  handleFilterChange,
  clearFilters,
  requestSort,
  getSortIcon,
  onUserListRefresh,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const getRoleBadge = (role) => {
    const roleConfig = {
      system_admin: { variant: "danger", text: "System Admin" },
      store_owner: { variant: "warning", text: "Store Owner" },
      normal_user: { variant: "secondary", text: "Normal User" },
    };
    const config = roleConfig[role] || { variant: "light", text: role };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleUserCreated = () => {
    setShowCreateForm(false);
    if (onUserListRefresh) {
      onUserListRefresh();
    }
  };

  const handleEditClick = (userId) => {
    setSelectedUserId(userId);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (userId, userName) => {
    if (
      window.confirm(
        `Are you sure you want to delete user "${userName}" (ID: ${userId})? This action cannot be undone.`
      )
    ) {
      try {
        await privateApi.delete(`/admin/users/${userId}`);
        alert("User deleted successfully!");
        if (onUserListRefresh) {
          onUserListRefresh();
        }
      } catch (err) {
        console.error(
          "Error deleting user:",
          err.response?.data || err.message
        );
        alert(
          `Failed to delete user: ${err.response?.data?.message || err.message}`
        );
      }
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedUserId(null);
  };

  const handleUserUpdated = () => {
    handleCloseEditModal();
    if (onUserListRefresh) {
      onUserListRefresh();
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 text-primary">
          <FaUsers className="me-2" />
          User Management
        </h4>
        <div>
          <Badge bg="primary" className="fs-6 me-2">
            {users.length} users
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

      <Collapse in={showCreateForm}>
        <div className="mb-4">
          <CreateUserForm
            onUserCreated={handleUserCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </Collapse>

      <EditUserModal
        show={showEditModal}
        onHide={handleCloseEditModal}
        userId={selectedUserId}
        onUserUpdated={handleUserUpdated}
      />

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" variant="primary" />
          <span className="ms-2">Loading users...</span>
        </div>
      ) : error ? (
        <Alert variant="danger" className="shadow-sm">
          {error}
        </Alert>
      ) : (
        <>
          {/* User Filters Card */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Filter Users</h6>
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
                <Col lg={3} md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by name..."
                      name="name"
                      value={filterTerms.name}
                      onChange={handleFilterChange}
                    />
                  </InputGroup>
                </Col>
                <Col lg={3} md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Filter by email..."
                    name="email"
                    value={filterTerms.email}
                    onChange={handleFilterChange}
                  />
                </Col>
                <Col lg={3} md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Filter by address..."
                    name="address"
                    value={filterTerms.address}
                    onChange={handleFilterChange}
                  />
                </Col>
                <Col lg={3} md={6}>
                  <Form.Select
                    name="role"
                    value={filterTerms.role}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Roles</option>
                    <option value="system_admin">System Admin</option>
                    <option value="store_owner">Store Owner</option>
                    <option value="normal_user">Normal User</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Users Table */}
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
                      Name {getSortIcon("name")}
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
                      onClick={() => requestSort("role")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Role {getSortIcon("role")}
                    </th>
                    <th
                      onClick={() => requestSort("created_at")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Created At {getSortIcon("created_at")}
                    </th>
                    <th className="border-0">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="align-middle">
                          <Badge bg="light" text="dark">
                            #{user.id}
                          </Badge>
                        </td>
                        <td className="align-middle fw-medium">{user.name}</td>
                        <td className="align-middle text-muted">
                          {user.email}
                        </td>
                        <td className="align-middle">
                          {user.address ? (
                            <span
                              className="text-truncate d-inline-block"
                              style={{ maxWidth: "200px" }}
                              title={user.address}
                            >
                              {user.address}
                            </span>
                          ) : (
                            <span className="text-muted fst-italic">
                              No address
                            </span>
                          )}
                        </td>
                        <td className="align-middle">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="align-middle text-muted small">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="align-middle">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditClick(user.id)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleDeleteClick(user.id, user.name)
                            }
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        <FaUsers size="3em" className="mb-3 opacity-25" />
                        <br />
                        No users found matching your criteria.
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

export default UserManagement;
