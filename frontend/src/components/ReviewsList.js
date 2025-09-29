import React from 'react';
import listStyles from '../ReviewsList.module.css';
import starStyles from '../StarRating.module.css';
import StarRating from './StarRating';

function ReviewsList({ reviews, onEditReview, onDeleteReview, filterText = "", darkMode }) {
  const highlightMatch = (text) => {
    if (!filterText) return text;
    const regex = new RegExp(`(${filterText})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? <span key={i} className="bg-yellow-200">{part}</span> : part
    );
  };

  if (!reviews) return <p>Loading reviews...</p>;
  if (reviews.length === 0) return <p className="text-center text-gray-500 mt-6">No reviews yet.</p>;

  return (
    <div className="grid gap-4">
      {reviews.map((review) => (
        <div key={review._id} className={`${listStyles.card} ${darkMode ? listStyles.darkCard : ''}`}>
          <div className={listStyles.reviewHeader}>
            <div>
              <strong className={listStyles.highlight}>{highlightMatch(review.username)}</strong> reviewed <em>{highlightMatch(review.repository)}</em>
              {/* <div className={styles.reviewInfo}>Rating: {review.rating}</div> */}
              <StarRating rating={review.rating} readOnly />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEditReview(review)}
                className={`${listStyles.button} ${listStyles.editButton}`}
              >
                Edit
              </button>
              <button
                onClick={() => onDeleteReview(review._id)}
                className={`${listStyles.button} ${listStyles.deleteButton}`}
              >
                Delete
              </button>
            </div>
          </div>
          <div className={listStyles.reviewComment}>{review.comment || "No comment"}</div>
          <div className={listStyles.reviewDates}>
            Created: {new Date(review.createdAt).toLocaleString()}
            {review.updatedAt && review.updatedAt !== review.createdAt && (
              <span> | Updated: {new Date(review.updatedAt).toLocaleString()}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReviewsList;
