const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../testApp');
const Train = require('../models/Train');
const Station = require('../models/Station');
const Review = require('../models/Review');
const User = require('../models/User');

// Test data
const testStations = [
  {
    _id: new mongoose.Types.ObjectId(),
    code: 'STN1',
    name: 'Station 1',
    city: 'City 1',
    state: 'State 1',
    pincode: '123456',
    latitude: 18.9876,
    longitude: 72.1234,
    location: {
      type: 'Point',
      coordinates: [72.1234, 18.9876]
    }
  },
  {
    _id: new mongoose.Types.ObjectId(),
    code: 'STN2',
    name: 'Station 2',
    city: 'City 2',
    state: 'State 2',
    pincode: '234567',
    latitude: 18.5432,
    longitude: 72.5678,
    location: {
      type: 'Point',
      coordinates: [72.5678, 18.5432]
    }
  },
  {
    _id: new mongoose.Types.ObjectId(),
    code: 'STN3',
    name: 'Station 3',
    city: 'City 3',
    state: 'State 3',
    pincode: '345678',
    latitude: 18.1098,
    longitude: 72.9012,
    location: {
      type: 'Point',
      coordinates: [72.9012, 18.1098]
    }
  }
];

const testTrains = [
  {
    _id: new mongoose.Types.ObjectId(),
    trainNumber: '12345',
    name: 'Test Express',
    trainType: 'Express',
    source: testStations[0]._id,
    destination: testStations[2]._id,
    departureTime: new Date('2023-12-31T08:00:00Z'),
    arrivalTime: new Date('2023-12-31T20:00:00Z'),
    totalSeats: 500,
    availableSeats: 300,
    fare: 1200,
    runningDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    status: 'Active',
    route: [
      {
        station: testStations[0]._id,
        arrivalTime: null,
        departureTime: new Date('2023-12-31T08:00:00Z'),
        distance: 0, // Cumulative distance from origin
        day: 0
      },
      {
        station: testStations[1]._id,
        arrivalTime: new Date('2023-12-31T12:00:00Z'),
        departureTime: new Date('2023-12-31T12:30:00Z'),
        distance: 400, // Cumulative distance from origin
        day: 0
      },
      {
        station: testStations[2]._id,
        arrivalTime: new Date('2023-12-31T20:00:00Z'),
        departureTime: null,
        distance: 800, // Cumulative distance from origin
        day: 0
      }
    ],
    classes: [
      {
        name: 'Sleeper',
        availableSeats: 200,
        fare: 800,
        totalSeats: 300
      },
      {
        name: 'AC',
        availableSeats: 100,
        fare: 1200,
        totalSeats: 150
      }
    ],
    amenities: ['Food', 'WiFi', 'Charging Points'],
    ratings: {
      average: 4.5,
      count: 100
    },
    reviews: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let testUser;
let testReview;

// Log database state
const logDatabaseState = async () => {
  const stations = await Station.find({});
  const trains = await Train.find({}).populate('route.station');
  const users = await User.find({});
  const reviews = await Review.find({}).populate('user train');
  
  console.log('\n=== Database State ===');
  console.log('Stations:', stations.length);
  console.log('Trains:', trains.length);
  console.log('Users:', users.length);
  console.log('Reviews:', reviews.length);
  
  if (trains.length > 0 && trains[0].route) {
    console.log('\nSample Train Route:');
    console.log(JSON.stringify(trains[0].route, null, 2));
  }
  console.log('===================\n');
};

// Setup test database before running tests
beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/railway-planner-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Clear test database
  await Promise.all([
    Station.deleteMany({}),
    Train.deleteMany({}),
    User.deleteMany({}),
    Review.deleteMany({})
  ]);

  // Insert test data
  await Station.insertMany(testStations);
  await Train.insertMany(testTrains);

  // Create a test user
  testUser = new User({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  });
  await testUser.save();

  // Create a test review
  testReview = new Review({
    user: testUser._id,
    train: testTrains[0]._id,
    rating: 5,
    title: 'Great journey!',
    comment: 'The train was very comfortable and the staff was very helpful. The journey was smooth and on time.',
    journeyDate: new Date('2023-12-15'),
    likes: [],
    dislikes: [],
    keywords: ['comfortable', 'helpful', 'smooth', 'on time']
  });
  await testReview.save();

  // Add review to train
  await Train.findByIdAndUpdate(testTrains[0]._id, {
    $push: { reviews: testReview._id },
    $inc: { 'ratings.count': 1, 'ratings.total': 5 }
  });
  
  // Log database state
  await logDatabaseState();
});

// Close database connection after tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Search Routes', () => {
  describe('GET /api/search/shortest-path', () => {
    it('should find the shortest path between two stations', async () => {
      const fromStation = testStations[0]._id.toString();
      const toStation = testStations[2]._id.toString();
      
      console.log('Testing shortest path between:', {
        from: fromStation,
        to: toStation
      });

      // Log all stations for reference
      const allStations = await Station.find({});
      console.log('All stations in DB:', allStations.map(s => ({
        _id: s._id.toString(),
        code: s.code,
        name: s.name
      })));

      const res = await request(app)
        .get('/api/search/shortest-path')
        .query({
          from: fromStation,
          to: toStation
        });

      console.log('Shortest path response:', {
        status: res.statusCode,
        body: res.body,
        request: {
          url: `/api/search/shortest-path?from=${fromStation}&to=${toStation}`
        }
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('path');
      expect(Array.isArray(res.body.data.path)).toBe(true);
      expect(res.body.data.path.length).toBeGreaterThan(0);
    });

    it('should return 400 if source or destination is missing', async () => {
      const res = await request(app)
        .get('/api/search/shortest-path')
        .query({ from: testStations[0]._id });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/search/search-path', () => {
    it('should find all paths between two stations', async () => {
      const fromStation = testStations[0]._id.toString();
      const toStation = testStations[2]._id.toString();
      
      console.log('Testing search path between:', {
        from: fromStation,
        to: toStation,
        limit: 3
      });

      const res = await request(app)
        .get('/api/search/search-path')
        .query({
          from: fromStation,
          to: toStation,
          limit: 3
        });

      console.log('Search path response:', {
        status: res.statusCode,
        body: res.body,
        request: {
          url: `/api/search/search-path?from=${fromStation}&to=${toStation}&limit=3`
        }
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('count');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/search/reviews/search', () => {
    it('should search reviews with KMP algorithm', async () => {
      const res = await request(app)
        .get('/api/search/reviews/search')
        .query({
          query: 'comfortable',
          limit: 5
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.count).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('highlightedText');
    });

    it('should return empty results for non-matching query', async () => {
      const res = await request(app)
        .get('/api/search/reviews/search')
        .query({
          query: 'nonexistentword',
          limit: 5
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.count).toBe(0);
    });
  });

  describe('GET /api/search/reviews/autocomplete', () => {
    it('should return autocomplete suggestions for review words', async () => {
      const res = await request(app)
        .get('/api/search/reviews/autocomplete')
        .query({
          prefix: 'comf',
          limit: 5
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].toLowerCase()).toContain('comf');
    });
  });

  describe('POST /api/search/journeys/sort', () => {
    it('should sort journeys by departure time', async () => {
      const testJourneys = [
        {
          trainNumber: '12345',
          departureTime: '2023-12-31T10:00:00Z',
          arrivalTime: '2023-12-31T22:00:00Z',
          duration: '12h 0m',
          fare: 1200
        },
        {
          trainNumber: '12346',
          departureTime: '2023-12-31T08:00:00Z',
          arrivalTime: '2023-12-31T20:00:00Z',
          duration: '12h 0m',
          fare: 1000
        },
        {
          trainNumber: '12347',
          departureTime: '2023-12-31T12:00:00Z',
          arrivalTime: '2023-12-31T23:59:00Z',
          duration: '11h 59m',
          fare: 1500
        }
      ];

      const res = await request(app)
        .post('/api/search/journeys/sort')
        .send({
          journeys: testJourneys,
          sortBy: 'departureTime',
          order: 'asc',
          limit: 2
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.count).toBe(2);
      expect(res.body.data[0].trainNumber).toBe('12346'); // Earliest departure
      expect(res.body.data[1].trainNumber).toBe('12345');
    });
  });
});
