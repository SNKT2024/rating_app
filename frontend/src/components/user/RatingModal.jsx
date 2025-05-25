import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { privateApi } from "../../api/axios";
import { FaStar, FaSave } from "react-icons/fa";

const RatingModal = ({ show, onHide, store }) => {
  // Determine if it's a new rating or an edit based on store.userSubmittedRating and store.userRatingId
  const isEditing =
    store && store.userSubmittedRating !== null && store.userRatingId !== null;

  const [rating, setRating] = useState(store?.userSubmittedRating || ""); // Current rating
  const [hoverRating, setHoverRating] = useState(0); // For hover effect on stars
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Update rating state when store prop changes (e.g., modal is opened for a new store or edit)
  useEffect(() => {
    if (store) {
      setRating(store.userSubmittedRating || "");
      setHoverRating(0); // Reset hover
      setError("");
      setSuccess("");
    }
  }, [store, show]); // Also reset when modal is shown/hidden

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
        // Modify existing rating
        const response = await privateApi.put(
          `/ratings/${store.userRatingId}`,
          { rating }
        );
        setSuccess(response.data.message || "Rating updated successfully!");
      } else {
        // Submit new rating
        const response = await privateApi.post("/ratings", {
          storeId: store.storeId,
          rating,
        });
        setSuccess(response.data.message || "Rating submitted successfully!");
      }

      setTimeout(() => {
        onHide(); // Close modal and trigger parent refresh
      }, 1500); // Show success for 1.5 seconds
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
