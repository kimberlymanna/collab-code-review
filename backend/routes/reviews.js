const express = require('express');
const router = express.Router();
const Review = require('../models/Reviews.js');

// Get all reviews
router.get('/', async(req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new review
router.post('/', async (req, res) => {
  const { username, repository, rating, comment } = req.body;

  const review = new Review ({
    username,
    repository,
    rating,
    comment,
  });

  try {
    const newReview = await review.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
})

// Update a review by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { username, repository, rating, comment } = req.body;

  try {
    // Only update fields if they are different
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    let isModified = false;

    if (username && username !== review.username) { review.username = username; isModified = true; }
    if (repository && repository !== review.repository) { review.repository = repository; isModified = true; }
    if (rating && rating !== review.rating) { review.rating = rating; isModified = true; }
    if (comment && comment !== review.comment) { review.comment = comment; isModified = true; }

    if (isModified) {
      await review.save(); // updatedAt will change automatically
    }

    res.json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.delete('/:id', async(req, res) => {
  const { id } = req.params;

  try {
    const deletedReview = await Review.findByIdAndDelete(id);

    if(!deletedReview){
      return res.status(404).json({ message: 'Review not found '});
    }

    res.json({ message: 'Review deleted successfully' });
  } catch {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
