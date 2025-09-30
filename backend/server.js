require('dotenv').config();
const express = require('express');
const cors = require('cors');
const reviewRoutes = require('./routes/reviews.js');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

app.use('/api/reviews', reviewRoutes);

module.exports = app; // <-- only export the app
