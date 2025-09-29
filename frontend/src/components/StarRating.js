import React, { useState } from "react";
import styles from "../StarRating.module.css";

export default function StarRating({ rating = 0, onRatingChange, readOnly = false }) {
  const [hover, setHover] = useState(0);

  const handleClick = (value) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          className={`${styles.star} ${
             value <= (hover || rating) ? styles.filled : ""
          } ${readOnly ? styles.readOnly : ""}`}
          onClick={() => handleClick(value)}
          onMouseEnter={() => !readOnly && setHover(value)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
