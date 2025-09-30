// tests/reviews.test.js
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Reviews = require('../models/Reviews'); // NOTE: Reviews with S
const express = require('express');
const reviewRoutes = require('../routes/reviews.js');

let app;
let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Ensure mongoose disconnects first (avoid openUri() errors)
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Set up express app with routes
  app = express();
  app.use(express.json());
  app.use('/api/reviews', reviewRoutes);
});

afterAll(async () => {
  jest.setTimeout(20000); // 20s timeout for cleanup
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  // Clear reviews after each test
  await Reviews.deleteMany({});
});

describe('Reviews API', () => {
  it('should create a new review', async () => {
    const newReview = {
      username: 'testuser',
      repository: 'owner/repo',
      rating: 5,
      comment: 'This is a test review',
    };

    const res = await request(app)
      .post('/api/reviews')
      .send(newReview);

    expect(res.statusCode).toBe(201);
    expect(res.body.username).toBe(newReview.username);
    expect(res.body.repository).toBe(newReview.repository);

    // Ensure it exists in DB
    const dbReview = await Reviews.findOne({ username: 'testuser' });
    expect(dbReview).not.toBeNull();
    expect(dbReview.rating).toBe(5);
  });

  it('should fetch all reviews', async () => {
    // Insert a review directly into DB
    const review = new Reviews({
      username: 'fetchuser',
      repository: 'owner/repo',
      rating: 4,
      comment: 'Fetch test',
    });
    await review.save();

    const res = await request(app).get('/api/reviews');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].username).toBe('fetchuser');
  });
});
