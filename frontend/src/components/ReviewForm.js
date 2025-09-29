import React, { useState, useEffect } from "react";
import styles from '../ReviewForm.module.css';

export default function ReviewForm({ onAddReview, editingReview, setEditingReview, darkMode }) {
  const [username, setUsername] = useState("");
  const [repository, setRepository] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (editingReview) {
      setUsername(editingReview.username || "");
      setRepository(editingReview.repository || "");
      setRating(editingReview.rating || 1);
      setComment(editingReview.comment || "");
    }
  }, [editingReview]);

  const validateForm = () => {
    let newErrors = {};

    if (!username.trim() || username.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    }

    if (!repository.trim() || !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repository)) {
      newErrors.repository = "Repository must be in format owner/repo.";
    }

    if (!rating || rating < 1 || rating > 5) {
      newErrors.rating = "Rating must be between 1 and 5.";
    }

    if (!comment.trim() || comment.length < 10) {
      newErrors.comment = "Comment must be at least 10 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const method = editingReview ? "PUT" : "POST";
      const url = editingReview 
          ? `http://localhost:4000/api/reviews/${editingReview._id}`
          : "http://localhost:4000/api/reviews";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, repository, rating: Number(rating), comment }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      const savedReview = await response.json(); // Backend response includes _id and createdAt
      onAddReview(savedReview); // Pass the actual saved review to state

      setSuccessMessage(editingReview ? "Review updated successfully!" : "Review submitted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reset form
      handleCancel();
    } catch (err) {
      console.error("Error submitting review:", err);
      setErrors({ submit: "Failed to submit review. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername("");
    setRepository("");
    setRating("");
    setComment("");
    setErrors({});
    if(editingReview) setEditingReview(null); // exit edit mode
  };


  return (
    <form onSubmit={handleSubmit} className={`${styles.formContainer} ${darkMode ? styles.darkForm : ''}`}>
      {successMessage && (
        <div className={styles.successBanner}>
          {successMessage}
        </div>
      )}
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.inputField}
        />
        {errors.username && <p className={styles.errorText}>{errors.username}</p>}
      </div>

      <div>
        <input
          type="text"
          placeholder="Repository (e.g., owner/repo)"
          value={repository}
          onChange={(e) => setRepository(e.target.value)}
          className={styles.inputField}
        />
        {errors.repository && <p className={styles.errorText}>{errors.repository}</p>}
      </div>

      <div>
        <label className="block mb-1 font-medium">Rating:</label>
        <StarRating rating={rating} setRating={(val) => setRating(val)} />
        {errors.rating && <p className={styles.errorText}>{errors.rating}</p>}
      </div>

      <div>
        <textarea
          placeholder="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={styles.textareaField}
          rows="4"
        />
        {errors.comment && <p className={styles.errorText}>{errors.comment}</p>}
      </div>

      <button type="submit" disabled={loading} className={`${styles.submitButton} ${loading ? styles.submitButtonDisabled : ""}`}>
        {loading ? "Submitting..." : editingReview ? "Update Review" : "Submit Review"}
      </button>

      <div>
        {editingReview && (
          <button type="button" onClick={handleCancel} className={styles.cancelButton}> Cancel </button>
        )}
      </div>
    </form>
  );
}
