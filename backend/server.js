require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const reviewRoutes = require('./routes/reviews.js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('Backend server is running!');
})

app.use('/api/reviews', reviewRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})
