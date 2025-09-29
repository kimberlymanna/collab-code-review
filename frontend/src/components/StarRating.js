import React from "react";

export default function StarRating({ rating, setRating, readOnly = false }) {
    const handleClick = (value) => {
        if (!readOnly && setRating) setRating(value);
    }
}