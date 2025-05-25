import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Alert,
  Spinner,
  Form,
  InputGroup,
  Row,
  Col,
  Button,
  Card,
  Badge,
} from "react-bootstrap";
import { privateApi } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FaStore, FaStar, FaEdit, FaPlus, FaSearch } from "react-icons/fa";
import RatingModal from "../components/user/RatingModal";

const StoresList = () => {
  const {
    isAuthenticated,
    loading: authLoading,
    isNormalUser,
    isStoreOwner,
  } = useAuth();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [filterTerms, setFilterTerms] = useState({
    name: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for Rating Modal
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const fetchStores = async () => {
    if (authLoading || !isAuthenticated || (!isNormalUser && !isStoreOwner)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await privateApi.get("/stores");
      setStores(response.data);
    } catch (err) {
      console.error(
        "Error fetching stores:",
        err.response?.data || err.message
      );
      setError(
        `Failed to load stores: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [authLoading, isAuthenticated, isNormalUser, isStoreOwner]);

  useEffect(() => {
    let currentStores = [...stores];

    currentStores = currentStores.filter((store) => {
      return (
        store.storeName
          .toLowerCase()
          .includes(filterTerms.name.toLowerCase()) &&
        (store.storeAddress
          ? store.storeAddress
              .toLowerCase()
              .includes(filterTerms.address.toLowerCase())
          : filterTerms.address === "")
      );
    });

    currentStores.sort((a, b) => a.storeName.localeCompare(b.storeName));

    setFilteredStores(currentStores);
  }, [stores, filterTerms]);

  // --- Filter Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterTerms((prevTerms) => ({ ...prevTerms, [name]: value }));
  };

  const clearFilters = () => {
    setFilterTerms({
      name: "",
      address: "",
    });
  };

  const handleShowRatingModal = (store) => {
    setSelectedStore(store);
    setShowRatingModal(true);
  };

  const handleHideRatingModal = () => {
    setShowRatingModal(false);
    setSelectedStore(null);
    fetchStores();
  };

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

  if (authLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading Auth...</span>
        </Spinner>
      </Container>
    );
  }

  if (!isAuthenticated || (!isNormalUser && !isStoreOwner)) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger" className="shadow-sm">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p className="mb-0">
            You must be logged in as a Normal User or Store Owner to view this
            page.
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4">
      <h2 className="mb-4 text-primary">
        <FaStore className="me-2" />
        All Stores
      </h2>

      {/* Filters Card */}
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
            <Col md={6}>
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
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by address..."
                  name="address"
                  value={filterTerms.address}
                  onChange={handleFilterChange}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" variant="primary" />
          <span className="ms-2">Loading stores...</span>
        </div>
      ) : error ? (
        <Alert variant="danger" className="shadow-sm">
          {error}
        </Alert>
      ) : (
        <Card className="shadow-sm border-0 mb-5">
          <div className="table-responsive">
            <Table className="mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th className="border-0">ID</th>
                  <th className="border-0">Store Name</th>
                  <th className="border-0">Address</th>
                  <th className="border-0">Overall Rating</th>
                  <th className="border-0">Your Rating</th>
                  <th className="border-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.length > 0 ? (
                  filteredStores.map((store) => (
                    <tr key={store.storeId}>
                      <td className="align-middle">
                        <Badge bg="light" text="dark">
                          #{store.storeId}
                        </Badge>
                      </td>
                      <td className="align-middle fw-medium">
                        {store.storeName}
                      </td>
                      <td className="align-middle">
                        {store.storeAddress || "N/A"}
                      </td>
                      <td className="align-middle">
                        {getRatingStars(store.overallRating)}
                      </td>
                      <td className="align-middle">
                        {store.userSubmittedRating !== null ? (
                          <span className="fw-bold">
                            {store.userSubmittedRating.toFixed(1)}{" "}
                            <FaStar className="text-warning" size="0.8em" />
                          </span>
                        ) : (
                          <span className="text-muted fst-italic">
                            Not rated
                          </span>
                        )}
                      </td>
                      <td className="align-middle">
                        <Button
                          variant={
                            store.userSubmittedRating !== null
                              ? "outline-info"
                              : "info"
                          }
                          size="sm"
                          onClick={() => handleShowRatingModal(store)}
                        >
                          {store.userSubmittedRating !== null ? (
                            <FaEdit />
                          ) : (
                            <FaPlus />
                          )}
                          {store.userSubmittedRating !== null
                            ? " Edit Rating"
                            : " Submit Rating"}
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
      )}

      {selectedStore && (
        <RatingModal
          show={showRatingModal}
          onHide={handleHideRatingModal}
          store={selectedStore}
        />
      )}
    </Container>
  );
};

export default StoresList;
