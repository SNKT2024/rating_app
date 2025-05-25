import React from "react";
import { Card, Row, Col, Alert, Spinner } from "react-bootstrap";
import { FaUsers, FaStore, FaStar } from "react-icons/fa";

const AdminStats = ({ stats, loading, error }) => {
  return (
    <div>
      <h4 className="mb-4">System Statistics</h4>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" variant="primary" />
          <span className="ms-2">Loading statistics...</span>
        </div>
      ) : error ? (
        <Alert variant="danger" className="shadow-sm">
          {error}
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
    </div>
  );
};

export default AdminStats;
