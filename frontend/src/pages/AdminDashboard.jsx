import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import {
  Container,
  Alert,
  Spinner,
  ButtonGroup,
  Button,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { privateApi } from "../api/axios";
import {
  FaChartBar,
  FaUsers,
  FaStore,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";

// Import the new sub-components
import AdminStats from "../components/admin/AdminStats";
import UserManagement from "../components/admin/UserManagement";
import StoreManagement from "../components/admin/StoreManagement";

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // --- Dashboard Stats States ---
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState("");

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
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState("");

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
  const [loadingStores, setLoadingStores] = useState(true);
  const [errorStores, setErrorStores] = useState("");

  // --- Fetching Callbacks (Memoized to prevent unnecessary re-fetches) ---
  const fetchDashboardStats = useCallback(async () => {
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
  }, [authLoading, isAdmin]); // Dependencies for useCallback

  const fetchUsers = useCallback(async () => {
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
  }, [authLoading, isAdmin]); // Dependencies for useCallback

  const fetchStores = useCallback(async () => {
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
  }, [authLoading, isAdmin]); // Dependencies for useCallback

  // --- Effects to trigger fetching ---
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

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

  // --- Filter Handlers (Passed to Child Components) ---
  const handleUserFilterChange = (e) => {
    const { name, value } = e.target;
    setUserFilterTerms((prevTerms) => ({ ...prevTerms, [name]: value }));
  };

  const handleStoreFilterChange = (e) => {
    const { name, value } = e.target;
    setStoreFilterTerms((prevTerms) => ({ ...prevTerms, [name]: value }));
  };

  // --- Clear Filter Handlers (Passed to Child Components) ---
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

  // --- Sorting Handlers (Passed to Child Components) ---
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

  // --- Access Control and Loading States for Main Dashboard ---
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

      {/* Navigation Pills (Tabs) */}
      <div className="my-4">
        <ButtonGroup>
          <Button
            variant={activeTab === "overview" ? "primary" : "outline-primary"}
            onClick={() => setActiveTab("overview")}
          >
            <FaChartBar className="me-1" /> Overview
          </Button>
          <Button
            variant={activeTab === "users" ? "primary" : "outline-primary"}
            onClick={() => setActiveTab("users")}
          >
            <FaUsers className="me-1" /> Users ({filteredUsers.length})
          </Button>
          <Button
            variant={activeTab === "stores" ? "primary" : "outline-primary"}
            onClick={() => setActiveTab("stores")}
          >
            <FaStore className="me-1" /> Stores ({filteredStores.length})
          </Button>
        </ButtonGroup>
      </div>

      {/* Conditional Rendering based on activeTab */}
      {activeTab === "overview" && (
        <AdminStats stats={stats} loading={loadingStats} error={errorStats} />
      )}
      {activeTab === "users" && (
        <UserManagement
          users={filteredUsers}
          loading={loadingUsers}
          error={errorUsers}
          filterTerms={userFilterTerms}
          handleFilterChange={handleUserFilterChange}
          clearFilters={clearUserFilters}
          sortConfig={userSortConfig}
          requestSort={requestUserSort}
          getSortIcon={getUserSortIcon}
          onUserListRefresh={fetchUsers}
        />
      )}
      {activeTab === "stores" && (
        <StoreManagement
          stores={filteredStores}
          loading={loadingStores}
          error={errorStores}
          filterTerms={storeFilterTerms}
          handleFilterChange={handleStoreFilterChange}
          clearFilters={clearStoreFilters}
          sortConfig={storeSortConfig}
          requestSort={requestStoreSort}
          getSortIcon={getStoreSortIcon}
          onStoreListRefresh={fetchStores}
        />
      )}
    </Container>
  );
};

export default AdminDashboard;
