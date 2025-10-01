const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  username: {                   // who submitted review
    type: String,
    required: true,
  },
  repository: {                 // repo being reviewed
    type: String,
    required: true,
  },
  rating: {                     // aids in review process
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {                    //freeform note or feedback
    type: String,
    required: false,
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  }
}, { timestamps: true });        // <-- adds createdAt and updatedAT automatically


module.exports = mongoose.model('Review', reviewSchema);
