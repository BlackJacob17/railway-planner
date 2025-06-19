const mongoose = require('mongoose');
const Station = require('./models/Station');
require('dotenv').config();

const sampleStations = [
  { 
    _id: '60d5ecb858787c1b9c8d9a4a', 
    name: 'Mumbai Central', 
    code: 'MMCT',
    city: 'Mumbai',
    state: 'Maharashtra',
    zone: 'WR',
    latitude: 18.9699,
    longitude: 72.8198,
    location: {
      type: 'Point',
      coordinates: [72.8198, 18.9699] // Note: MongoDB uses [longitude, latitude]
    }
  },
  { 
    _id: '60d5ecc258787c1b9c8d9a4b', 
    name: 'New Delhi', 
    code: 'NDLS',
    city: 'New Delhi',
    state: 'Delhi',
    zone: 'NR',
    latitude: 28.6418,
    longitude: 77.2206,
    location: {
      type: 'Point',
      coordinates: [77.2206, 28.6418]
    }
  },
  { 
    _id: '60d5eccb58787c1b9c8d9a4c', 
    name: 'Chennai Central', 
    code: 'MAS',
    city: 'Chennai',
    state: 'Tamil Nadu',
    zone: 'SR',
    latitude: 13.0827,
    longitude: 80.2707,
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827]
    }
  },
  { 
    _id: '60d5ecd458787c1b9c8d9a4d', 
    name: 'Howrah', 
    code: 'HWH',
    city: 'Kolkata',
    state: 'West Bengal',
    zone: 'ER',
    latitude: 22.5958,
    longitude: 88.3378,
    location: {
      type: 'Point',
      coordinates: [88.3378, 22.5958]
    }
  },
  { 
    _id: '60d5ecdd58787c1b9c8d9a4e', 
    name: 'Bengaluru City', 
    code: 'SBC',
    city: 'Bengaluru',
    state: 'Karnataka',
    zone: 'SWR',
    latitude: 12.9774,
    longitude: 77.5667,
    location: {
      type: 'Point',
      coordinates: [77.5667, 12.9774]
    }
  },
  { 
    _id: '60d5ece658787c1b9c8d9a4f', 
    name: 'Ahmedabad', 
    code: 'ADI',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zone: 'WR',
    latitude: 23.0225,
    longitude: 72.5714,
    location: {
      type: 'Point',
      coordinates: [72.5714, 23.0225]
    }
  },
  { 
    _id: '60d5ece658787c1b9c8d9a50', 
    name: 'Pune', 
    code: 'PUNE',
    city: 'Pune',
    state: 'Maharashtra',
    zone: 'CR',
    latitude: 18.5204,
    longitude: 73.8567,
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.5204]
    }
  },
  { 
    _id: '60d5ece658787c1b9c8d9a51', 
    name: 'Jaipur', 
    code: 'JP',
    city: 'Jaipur',
    state: 'Rajasthan',
    zone: 'NWR',
    latitude: 26.9124,
    longitude: 75.7873,
    location: {
      type: 'Point',
      coordinates: [75.7873, 26.9124]
    }
  },
  { 
    _id: '60d5ece658787c1b9c8d9a52', 
    name: 'Lucknow', 
    code: 'LKO',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    zone: 'NER',
    latitude: 26.8467,
    longitude: 80.9462,
    location: {
      type: 'Point',
      coordinates: [80.9462, 26.8467]
    }
  },
  { 
    _id: '60d5ece658787c1b9c8d9a53', 
    name: 'Patna', 
    code: 'PNBE',
    city: 'Patna',
    state: 'Bihar',
    zone: 'ECR',
    latitude: 25.5941,
    longitude: 85.1376,
    location: {
      type: 'Point',
      coordinates: [85.1376, 25.5941]
    }
  },
  { 
    _id: '60d5ece658787c1b9c8d9a54', 
    name: 'Hyderabad', 
    code: 'HYB',
    city: 'Hyderabad',
    state: 'Telangana',
    zone: 'SCR',
    latitude: 17.3850,
    longitude: 78.4867,
    location: {
      type: 'Point',
      coordinates: [78.4867, 17.3850]
    }
  },
  { 
    _id: '60d5ece658787c1b9c8d9a55', 
    name: 'Chhatrapati Shivaji Maharaj Terminus', 
    code: 'CSMT',
    city: 'Mumbai',
    state: 'Maharashtra',
    zone: 'CR',
    latitude: 18.9398,
    longitude: 72.8354,
    location: {
      type: 'Point',
      coordinates: [72.8354, 18.9398]
    }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/railway_planner', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing stations
    await Station.deleteMany({});
    console.log('Cleared existing stations');

    // Insert sample stations
    const createdStations = await Station.insertMany(sampleStations);
    console.log(`Inserted ${createdStations.length} stations`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
