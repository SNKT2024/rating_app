import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Alert,
  Spinner,
  Table,
  Badge,
} from "react-bootstrap";
import { privateApi } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { FaStore, FaStar, FaUser, FaComments } from "react-icons/fa";

const StoreOwnerDashboard = () => {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    isStoreOwner,
  } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading || !isAuthenticated || !isStoreOwner) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await privateApi.get("/store-owner/dashboard");
        setDashboardData(response.data);
      } catch (err) {
        console.error(
          "Error fetching store owner dashboard data:",
          err.response?.data || err.message
        );
        setError(
          `Failed to load dashboard data: ${
            err.response?.data?.message || err.message
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authLoading, isAuthenticated, isStoreOwner]); // Re-fetch when auth status or role changes

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

  if (!isAuthenticated || !isStoreOwner) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger" className="shadow-sm">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p className="mb-0">
            You must be logged in as a Store Owner to view this page.
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4">
      <h2 className="mb-4 text-success">
        <FaStore className="me-2" />
        Store Owner Dashboard
      </h2>
      <p className="text-muted">Welcome, {user?.name || user?.email}!</p>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" variant="success" />
          <span className="ms-2">Loading dashboard data...</span>
        </div>
      ) : error ? (
        <Alert variant="danger" className="shadow-sm">
          {error}
        </Alert>
      ) : (
        <>
          {dashboardData.store ? (
            <>
              {/* Store Overview Card */}
              <Card className="shadow-sm border-0 mb-5">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">
                    <FaStore className="me-2" />
                    {dashboardData.store.name} Overview
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col md={6}>
                      <strong>Email:</strong>{" "}
                      {dashboardData.store.email || "N/A"}
                    </Col>
                    <Col md={6}>
                      <strong>Address:</strong>{" "}
                      {dashboardData.store.address || "N/A"}
                    </Col>
                  </Row>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center">
                    <h5>Overall Rating:</h5>
                    <div>
                      {getRatingStars(dashboardData.store.averageRating)}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Users Who Rated Your Store */}
              <h4 className="mb-4 text-primary">
                <FaComments className="me-2" />
                Ratings Received ({dashboardData.ratingsGivenByUsers.length})
              </h4>
              <Card className="shadow-sm border-0 mb-5">
                <div className="table-responsive">
                  <Table className="mb-0 table-hover">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0">User ID</th>
                        <th className="border-0">User Name</th>
                        <th className="border-0">User Email</th>
                        <th className="border-0">Rating</th>
                        <th className="border-0">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.ratingsGivenByUsers.length > 0 ? (
                        dashboardData.ratingsGivenByUsers.map((rating) => (
                          <tr
                            key={
                              rating.ratingId ||
                              `${rating.userId}-${rating.ratingDate}`
                            }
                          >
                            <td className="align-middle">
                              <Badge bg="light" text="dark">
                                #{rating.userId}
                              </Badge>
                            </td>
                            <td className="align-middle fw-medium">
                              {rating.userName}
                            </td>
                            <td className="align-middle text-muted">
                              {rating.userEmail}
                            </td>
                            <td className="align-middle">
                              {getRatingStars(rating.submittedRating)}
                            </td>
                            <td className="align-middle text-muted small">
                              {new Date(rating.ratingDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-4 text-muted"
                          >
                            <FaComments
                              size="3em"
                              className="mb-3 opacity-25"
                            />
                            <br />
                            No ratings received yet for this store.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card>
            </>
          ) : (
            <Alert variant="info" className="shadow-sm">
              <Alert.Heading>No Store Associated</Alert.Heading>
              <p className="mb-0">
                Your account is currently not associated with any store. Please
                contact a System Administrator.
              </p>
            </Alert>
          )}
        </>
      )}
    </Container>
  );
};

export default StoreOwnerDashboard;
