import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Alert,
  Spinner,
  Table,
  Form,
  InputGroup,
  Badge,
  Button,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { privateApi } from "../api/axios";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUsers,
  FaStore,
  FaStar,
} from "react-icons/fa";

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  // --- User List States ---
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userFilterTerms, setUserFilterTerms] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });
  const [userSortConfig, setUserSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // --- Store List States ---
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [storeFilterTerms, setStoreFilterTerms] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [storeSortConfig, setStoreSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // --- Loading and Error States ---
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);
  const [errorStats, setErrorStats] = useState("");
  const [errorUsers, setErrorUsers] = useState("");
  const [errorStores, setErrorStores] = useState("");

  // --- Fetch Dashboard Statistics ---
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (authLoading || !isAdmin) {
        setLoadingStats(false);
        return;
      }
      try {
        setLoadingStats(true);
        setErrorStats("");
        const response = await privateApi.get("/admin/dashboard-stats");
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching admin dashboard stats:", err);
        setErrorStats(
          `Failed to load dashboard statistics: ${
            err.response?.data?.message || err.message
          }`
        );
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDashboardStats();
  }, [authLoading, isAdmin]);

  // --- Fetch All Users ---
  useEffect(() => {
    const fetchUsers = async () => {
      if (authLoading || !isAdmin) {
        setLoadingUsers(false);
        return;
      }
      try {
        setLoadingUsers(true);
        setErrorUsers("");
        const response = await privateApi.get("/admin/users");
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setErrorUsers(
          `Failed to load user list: ${
            err.response?.data?.message || err.message
          }`
        );
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [authLoading, isAdmin]);

  // --- Fetch All Stores ---
  useEffect(() => {
    const fetchStores = async () => {
      if (authLoading || !isAdmin) {
        setLoadingStores(false);
        return;
      }
      try {
        setLoadingStores(true);
        setErrorStores("");
        const response = await privateApi.get("/admin/stores");
        setStores(response.data);
      } catch (err) {
        console.error("Error fetching stores:", err);
        setErrorStores(
          `Failed to load store list: ${
            err.response?.data?.message || err.message
          }`
        );
      } finally {
        setLoadingStores(false);
      }
    };
    fetchStores();
  }, [authLoading, isAdmin]);

  // --- Filtering and Sorting Logic for Users ---
  useEffect(() => {
    let currentUsers = [...users];

    currentUsers = currentUsers.filter((user) => {
      return (
        user.name.toLowerCase().includes(userFilterTerms.name.toLowerCase()) &&
        user.email
          .toLowerCase()
          .includes(userFilterTerms.email.toLowerCase()) &&
        (user.address
          ? user.address
              .toLowerCase()
              .includes(userFilterTerms.address.toLowerCase())
          : userFilterTerms.address === "") &&
        (userFilterTerms.role ? user.role === userFilterTerms.role : true)
      );
    });

    if (userSortConfig.key) {
      currentUsers.sort((a, b) => {
        let aValue = a[userSortConfig.key];
        let bValue = b[userSortConfig.key];

        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return userSortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return userSortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    setFilteredUsers(currentUsers);
  }, [users, userFilterTerms, userSortConfig]);

  // --- Filtering and Sorting Logic for Stores ---
  useEffect(() => {
    let currentStores = [...stores];

    currentStores = currentStores.filter((store) => {
      return (
        store.name
          .toLowerCase()
          .includes(storeFilterTerms.name.toLowerCase()) &&
        store.email
          .toLowerCase()
          .includes(storeFilterTerms.email.toLowerCase()) &&
        (store.address
          ? store.address
              .toLowerCase()
              .includes(storeFilterTerms.address.toLowerCase())
          : storeFilterTerms.address === "")
      );
    });

    if (storeSortConfig.key) {
      currentStores.sort((a, b) => {
        let aValue = a[storeSortConfig.key];
        let bValue = b[storeSortConfig.key];

        if (storeSortConfig.key === "averageRating") {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        } else if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return storeSortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return storeSortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    setFilteredStores(currentStores);
  }, [stores, storeFilterTerms, storeSortConfig]);

  // --- Filter Handlers ---
  const handleUserFilterChange = (e) => {
    const { name, value } = e.target;
    setUserFilterTerms((prevTerms) => ({ ...prevTerms, [name]: value }));
  };

  const handleStoreFilterChange = (e) => {
    const { name, value } = e.target;
    setStoreFilterTerms((prevTerms) => ({ ...prevTerms, [name]: value }));
  };

  // --- Clear Filter Handlers ---
  const clearUserFilters = () => {
    setUserFilterTerms({
      name: "",
      email: "",
      address: "",
      role: "",
    });
  };

  const clearStoreFilters = () => {
    setStoreFilterTerms({
      name: "",
      email: "",
      address: "",
    });
  };

  // --- Sorting Handlers ---
  const requestUserSort = (key) => {
    let direction = "asc";
    if (userSortConfig.key === key && userSortConfig.direction === "asc") {
      direction = "desc";
    }
    setUserSortConfig({ key, direction });
  };

  const requestStoreSort = (key) => {
    let direction = "asc";
    if (storeSortConfig.key === key && storeSortConfig.direction === "asc") {
      direction = "desc";
    }
    setStoreSortConfig({ key, direction });
  };

  const getUserSortIcon = (key) => {
    if (userSortConfig.key !== key) {
      return <FaSort className="ms-1 text-muted" />;
    }
    if (userSortConfig.direction === "asc") {
      return <FaSortUp className="ms-1 text-primary" />;
    }
    return <FaSortDown className="ms-1 text-primary" />;
  };

  const getStoreSortIcon = (key) => {
    if (storeSortConfig.key !== key) {
      return <FaSort className="ms-1 text-muted" />;
    }
    if (storeSortConfig.direction === "asc") {
      return <FaSortUp className="ms-1 text-primary" />;
    }
    return <FaSortDown className="ms-1 text-primary" />;
  };

  // --- Role Badge Component ---
  const getRoleBadge = (role) => {
    const roleConfig = {
      system_admin: { variant: "danger", text: "System Admin" },
      store_owner: { variant: "warning", text: "Store Owner" },
      normal_user: { variant: "secondary", text: "Normal User" },
    };
    const config = roleConfig[role] || { variant: "light", text: role };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  // --- Rating Stars Component ---
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

  // --- Access Control and Loading States ---
  if (authLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading Auth...</span>
        </Spinner>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger" className="shadow-sm">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p className="mb-0">
            You must be a System Administrator to view this page.
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center py-4 border-bottom">
        <div>
          <h2 className="mb-1 text-primary">System Administrator Dashboard</h2>
          <p className="text-muted mb-0">
            Welcome back, {user?.name || user?.email}!
          </p>
        </div>
      </div>

      {/* Dashboard Statistics Section */}
      <h4 className="mt-5">Overall Statistics</h4>
      {loadingStats ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" variant="primary" />
          <span className="ms-2">Loading statistics...</span>
        </div>
      ) : errorStats ? (
        <Alert variant="danger" className="shadow-sm">
          {errorStats}
        </Alert>
      ) : (
        <Row className="g-4 mb-5">
          <Col xl={4} md={6}>
            <Card className="shadow-sm border-0 h-100 bg-primary text-white">
              <Card.Body className="text-center">
                <FaUsers size="3em" className="mb-3 opacity-75" />
                <Card.Title className="h3">{stats.totalUsers}</Card.Title>
                <Card.Text className="mb-0">Total Users</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={4} md={6}>
            <Card className="shadow-sm border-0 h-100 bg-success text-white">
              <Card.Body className="text-center">
                <FaStore size="3em" className="mb-3 opacity-75" />
                <Card.Title className="h3">{stats.totalStores}</Card.Title>
                <Card.Text className="mb-0">Total Stores</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={4} md={6}>
            <Card className="shadow-sm border-0 h-100 bg-info text-white">
              <Card.Body className="text-center">
                <FaStar size="3em" className="mb-3 opacity-75" />
                <Card.Title className="h3">{stats.totalRatings}</Card.Title>
                <Card.Text className="mb-0">Total Ratings</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* User List Section */}
      <h4 className="mt-5">User Management</h4>
      {loadingUsers ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" variant="primary" />
          <span className="ms-2">Loading users...</span>
        </div>
      ) : errorUsers ? (
        <Alert variant="danger" className="shadow-sm">
          {errorUsers}
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
                  onClick={clearUserFilters}
                >
                  Clear All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col lg={3} md={6}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search by name..."
                      name="name"
                      value={userFilterTerms.name}
                      onChange={handleUserFilterChange}
                    />
                  </InputGroup>
                </Col>
                <Col lg={3} md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Filter by email..."
                    name="email"
                    value={userFilterTerms.email}
                    onChange={handleUserFilterChange}
                  />
                </Col>
                <Col lg={3} md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Filter by address..."
                    name="address"
                    value={userFilterTerms.address}
                    onChange={handleUserFilterChange}
                  />
                </Col>
                <Col lg={3} md={6}>
                  <Form.Select
                    name="role"
                    value={userFilterTerms.role}
                    onChange={handleUserFilterChange}
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
                      onClick={() => requestUserSort("id")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      ID {getUserSortIcon("id")}
                    </th>
                    <th
                      onClick={() => requestUserSort("name")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Name {getUserSortIcon("name")}
                    </th>
                    <th
                      onClick={() => requestUserSort("email")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Email {getUserSortIcon("email")}
                    </th>
                    <th
                      onClick={() => requestUserSort("address")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Address {getUserSortIcon("address")}
                    </th>
                    <th
                      onClick={() => requestUserSort("role")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Role {getUserSortIcon("role")}
                    </th>
                    <th
                      onClick={() => requestUserSort("created_at")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Created At {getUserSortIcon("created_at")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
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

      {/* Store List Section */}
      <h4 className="mt-5">Store Management</h4>
      {loadingStores ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" variant="success" />
          <span className="ms-2">Loading stores...</span>
        </div>
      ) : errorStores ? (
        <Alert variant="danger" className="shadow-sm">
          {errorStores}
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
                  onClick={clearStoreFilters}
                >
                  Clear All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col lg={4} md={6}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search by store name..."
                      name="name"
                      value={storeFilterTerms.name}
                      onChange={handleStoreFilterChange}
                    />
                  </InputGroup>
                </Col>
                <Col lg={4} md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Filter by email..."
                    name="email"
                    value={storeFilterTerms.email}
                    onChange={handleStoreFilterChange}
                  />
                </Col>
                <Col lg={4} md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Filter by address..."
                    name="address"
                    value={storeFilterTerms.address}
                    onChange={handleStoreFilterChange}
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
                      onClick={() => requestStoreSort("id")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      ID {getStoreSortIcon("id")}
                    </th>
                    <th
                      onClick={() => requestStoreSort("name")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Store Name {getStoreSortIcon("name")}
                    </th>
                    <th
                      onClick={() => requestStoreSort("email")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Email {getStoreSortIcon("email")}
                    </th>
                    <th
                      onClick={() => requestStoreSort("address")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Address {getStoreSortIcon("address")}
                    </th>
                    <th
                      onClick={() => requestStoreSort("averageRating")}
                      style={{ cursor: "pointer" }}
                      className="border-0"
                    >
                      Rating {getStoreSortIcon("averageRating")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStores.length > 0 ? (
                    filteredStores.map((store) => (
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
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
    </Container>
  );
};

export default AdminDashboard;
