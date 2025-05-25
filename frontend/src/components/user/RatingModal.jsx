import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { privateApi } from "../../api/axios";
import { FaStar, FaSave } from "react-icons/fa";

const RatingModal = ({ show, onHide, store }) => {
  const isEditing =
    store && store.userSubmittedRating !== null && store.userRatingId !== null;

  const [rating, setRating] = useState(store?.userSubmittedRating || "");
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (store) {
      setRating(store.userSubmittedRating || "");
      setHoverRating(0);
      setError("");
      setSuccess("");
    }
  }, [store, show]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (rating === "" || rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        const response = await privateApi.put(
          `/ratings/${store.userRatingId}`,
          { rating }
        );
        setSuccess(response.data.message || "Rating updated successfully!");
      } else {
        const response = await privateApi.post("/ratings", {
          storeId: store.storeId,
          rating,
        });
        setSuccess(response.data.message || "Rating submitted successfully!");
      }

      setTimeout(() => {
        onHide();
      }, 1000);
    } catch (err) {
      console.error(
        "Error submitting/modifying rating:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          "Failed to save rating. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? "Edit Your Rating" : "Submit a Rating"} for{" "}
          {store?.storeName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3 text-center">
            <Form.Label className="d-block mb-2">
              How would you rate this store?
            </Form.Label>
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size="2.5em"
                className={`cursor-pointer ${
                  (hoverRating || rating) > i ? "text-warning" : "text-muted"
                }`}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i + 1)}
                style={{ cursor: "pointer", transition: "color 0.2s" }}
              />
            ))}
            {rating > 0 && (
              <p className="mt-2 text-muted">
                You selected: {rating} Star{rating > 1 ? "s" : ""}
              </p>
            )}
          </Form.Group>

          <Button
            variant={isEditing ? "primary" : "info"}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <FaSave className="me-2" />
            )}
            {loading
              ? "Saving..."
              : isEditing
              ? "Update Rating"
              : "Submit Rating"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RatingModal;
