// Load environment variables first
require('dotenv').config({ path: __dirname + '/.env' });

const mongoose = require('mongoose');
const Train = require('./models/Train');
const Station = require('./models/Station');

// Log environment info for debugging
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('MongoDB URI:', process.env.MONGODB_URI ? '*** URI is set ***' : 'MONGODB_URI is not set!');

// Sample train data with valid station IDs from our previous seed
const sampleTrains = [
  {
    name: 'Rajdhani Express',
    trainNumber: '12951',
    source: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    destination: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    departureTime: new Date('2025-06-20T16:35:00'),
    arrivalTime: new Date('2025-06-21T08:45:00'),
    totalSeats: 500,
    availableSeats: 320,
    fare: 2500,
    trainType: 'Rajdhani',
    daysOfOperation: ['Mon', 'Wed', 'Fri', 'Sun'],
    route: [
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: null, departure: '16:35', distance: 0 }, // NDLS
      { station: '60d5ece658787c1b9c8d9a50', arrival: '20:15', departure: '20:20', distance: 200 }, // PUNE
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: '08:45', departure: null, distance: 1388 } // MMCT
    ]
  },
  {
    name: 'Shatabdi Express',
    trainNumber: '12009',
    source: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    destination: '60d5ecdd58787c1b9c8d9a4e', // Bengaluru City
    departureTime: new Date('2025-06-20T06:00:00'),
    arrivalTime: new Date('2025-06-20T23:00:00'),
    totalSeats: 400,
    availableSeats: 180,
    fare: 3200,
    trainType: 'Shatabdi',
    daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    route: [
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: null, departure: '06:00', distance: 0 }, // NDLS
      { station: '60d5ecd458787c1b9c8d9a4d', arrival: '14:30', departure: '14:35', distance: 1350 }, // HWH
      { station: '60d5ecdd58787c1b9c8d9a4e', arrival: '23:00', departure: null, distance: 2150 } // SBC
    ]
  },
  // Add more trains here...
  {
    name: 'Duronto Express',
    trainNumber: '12259',
    source: '60d5ece658787c1b9c8d9a4f', // Ahmedabad
    destination: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    departureTime: new Date('2025-06-20T23:15:00'),
    arrivalTime: new Date('2025-06-21T06:30:00'),
    totalSeats: 600,
    availableSeats: 420,
    fare: 1800,
    trainType: 'Duronto',
    daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    route: [
      { station: '60d5ece658787c1b9c8d9a4f', arrival: null, departure: '23:15', distance: 0 }, // ADI
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: '06:30', departure: null, distance: 530 } // MMCT
    ]
  },
  {
    name: 'Garib Rath',
    trainNumber: '12901',
    source: '60d5eccb58787c1b9c8d9a4c', // Chennai Central
    destination: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    departureTime: new Date('2025-06-20T11:30:00'),
    arrivalTime: new Date('2025-06-21T15:45:00'),
    totalSeats: 1200,
    availableSeats: 750,
    fare: 2800,
    trainType: 'Express',
    daysOfOperation: ['Mon', 'Wed', 'Fri', 'Sun'],
    route: [
      { station: '60d5eccb58787c1b9c8d9a4c', arrival: null, departure: '11:30', distance: 0 }, // MAS
      { station: '60d5ecdd58787c1b9c8d9a4e', arrival: '18:45', departure: '18:50', distance: 360 }, // SBC
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: '15:45', departure: null, distance: 2180 } // NDLS
    ]
  },
  {
    name: 'Vande Bharat Express',
    trainNumber: '20901',
    source: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    destination: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    departureTime: new Date('2025-06-20T06:00:00'),
    arrivalTime: new Date('2025-06-20T22:30:00'),
    totalSeats: 300,
    availableSeats: 120,
    fare: 3500,
    trainType: 'Shatabdi',
    daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    route: [
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: null, departure: '06:00', distance: 0 }, // MMCT
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: '22:30', departure: null, distance: 1388 } // NDLS
    ]
  },
  // Add more trains as needed...
  {
    name: 'Shatabdi Express',
    trainNumber: '12010',
    source: '60d5ecdd58787c1b9c8d9a4e', // Bengaluru City
    destination: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    departureTime: new Date('2025-06-20T06:00:00'),
    arrivalTime: new Date('2025-06-20T23:00:00'),
    totalSeats: 400,
    availableSeats: 150,
    fare: 3400,
    trainType: 'Shatabdi',
    daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    route: [
      { station: '60d5ecdd58787c1b9c8d9a4e', arrival: null, departure: '06:00', distance: 0 }, // SBC
      { station: '60d5ecd458787c1b9c8d9a4d', arrival: '14:30', departure: '14:35', distance: 800 }, // HWH
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: '23:00', departure: null, distance: 2150 } // NDLS
    ]
  },
  {
    name: 'Rajdhani Express',
    trainNumber: '12952',
    source: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    destination: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    departureTime: new Date('2025-06-20T16:35:00'),
    arrivalTime: new Date('2025-06-21T08:45:00'),
    totalSeats: 500,
    availableSeats: 280,
    fare: 2600,
    trainType: 'Rajdhani',
    daysOfOperation: ['Mon', 'Wed', 'Fri', 'Sun'],
    route: [
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: null, departure: '16:35', distance: 0 }, // MMCT
      { station: '60d5ece658787c1b9c8d9a50', arrival: '20:15', departure: '20:20', distance: 200 }, // PUNE
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: '08:45', departure: null, distance: 1388 } // NDLS
    ]
  },
  {
    name: 'Duronto Express',
    trainNumber: '12260',
    source: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    destination: '60d5ece658787c1b9c8d9a4f', // Ahmedabad
    departureTime: new Date('2025-06-21T23:15:00'),
    arrivalTime: new Date('2025-06-22T06:30:00'),
    totalSeats: 600,
    availableSeats: 390,
    fare: 1700,
    trainType: 'Duronto',
    daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    route: [
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: null, departure: '23:15', distance: 0 }, // MMCT
      { station: '60d5ece658787c1b9c8d9a4f', arrival: '06:30', departure: null, distance: 530 } // ADI
    ]
  },
  {
    name: 'Garib Rath',
    trainNumber: '12902',
    source: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    destination: '60d5eccb58787c1b9c8d9a4c', // Chennai Central
    departureTime: new Date('2025-06-21T11:30:00'),
    arrivalTime: new Date('2025-06-22T15:45:00'),
    totalSeats: 1200,
    availableSeats: 920,
    fare: 2900,
    trainType: 'Express',
    daysOfOperation: ['Tue', 'Thu', 'Sat'],
    route: [
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: null, departure: '11:30', distance: 0 }, // NDLS
      { station: '60d5ecdd58787c1b9c8d9a4e', arrival: '18:45', departure: '18:50', distance: 1750 }, // SBC
      { station: '60d5eccb58787c1b9c8d9a4c', arrival: '15:45', departure: null, distance: 2180 } // MAS
    ]
  },
  {
    name: 'Vande Bharat Express',
    trainNumber: '20902',
    source: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    destination: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    departureTime: new Date('2025-06-21T06:00:00'),
    arrivalTime: new Date('2025-06-21T22:30:00'),
    totalSeats: 300,
    availableSeats: 95,
    fare: 3600,
    trainType: 'Shatabdi',
    daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    route: [
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: null, departure: '06:00', distance: 0 }, // NDLS
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: '22:30', departure: null, distance: 1388 } // MMCT
    ]
  },
  {
    name: 'Shatabdi Express',
    trainNumber: '12011',
    source: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    destination: '60d5ecd458787c1b9c8d9a4d', // Howrah
    departureTime: new Date('2025-06-21T06:00:00'),
    arrivalTime: new Date('2025-06-21T14:30:00'),
    totalSeats: 400,
    availableSeats: 220,
    fare: 2800,
    trainType: 'Shatabdi',
    daysOfOperation: ['Mon', 'Wed', 'Fri', 'Sun'],
    route: [
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: null, departure: '06:00', distance: 0 }, // NDLS
      { station: '60d5ecd458787c1b9c8d9a4d', arrival: '14:30', departure: null, distance: 1450 } // HWH
    ]
  },
  {
    name: 'Rajdhani Express',
    trainNumber: '12301',
    source: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    destination: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    departureTime: new Date('2025-06-21T16:35:00'),
    arrivalTime: new Date('2025-06-22T08:45:00'),
    totalSeats: 500,
    availableSeats: 310,
    fare: 2700,
    trainType: 'Rajdhani',
    daysOfOperation: ['Tue', 'Thu', 'Sat'],
    route: [
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: null, departure: '16:35', distance: 0 }, // MMCT
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: '08:45', departure: null, distance: 1388 } // NDLS
    ]
  },
  {
    name: 'Duronto Express',
    trainNumber: '12261',
    source: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    destination: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    departureTime: new Date('2025-06-20T23:15:00'),
    arrivalTime: new Date('2025-06-21T11:30:00'),
    totalSeats: 600,
    availableSeats: 410,
    fare: 1900,
    trainType: 'Duronto',
    daysOfOperation: ['Mon', 'Wed', 'Fri', 'Sun'],
    route: [
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: null, departure: '23:15', distance: 0 }, // NDLS
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: '11:30', departure: null, distance: 1388 } // MMCT
    ]
  },
  {
    name: 'Garib Rath',
    trainNumber: '12903',
    source: '60d5eccb58787c1b9c8d9a4c', // Chennai Central
    destination: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    departureTime: new Date('2025-06-22T11:30:00'),
    arrivalTime: new Date('2025-06-23T15:45:00'),
    totalSeats: 1200,
    availableSeats: 880,
    fare: 2950,
    trainType: 'Express',
    daysOfOperation: ['Mon', 'Wed', 'Fri'],
    route: [
      { station: '60d5eccb58787c1b9c8d9a4c', arrival: null, departure: '11:30', distance: 0 }, // MAS
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: '15:45', departure: null, distance: 2180 } // NDLS
    ]
  },
  {
    name: 'Vande Bharat Express',
    trainNumber: '20903',
    source: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    destination: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    departureTime: new Date('2025-06-22T06:00:00'),
    arrivalTime: new Date('2025-06-22T22:30:00'),
    totalSeats: 300,
    availableSeats: 110,
    fare: 3700,
    trainType: 'Shatabdi',
    daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    route: [
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: null, departure: '06:00', distance: 0 }, // MMCT
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: '22:30', departure: null, distance: 1388 } // NDLS
    ]
  },
  {
    name: 'Shatabdi Express',
    trainNumber: '12012',
    source: '60d5ecd458787c1b9c8d9a4d', // Howrah
    destination: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    departureTime: new Date('2025-06-22T06:00:00'),
    arrivalTime: new Date('2025-06-22T14:30:00'),
    totalSeats: 400,
    availableSeats: 240,
    fare: 2900,
    trainType: 'Shatabdi',
    daysOfOperation: ['Mon', 'Wed', 'Fri', 'Sun'],
    route: [
      { station: '60d5ecd458787c1b9c8d9a4d', arrival: null, departure: '06:00', distance: 0 }, // HWH
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: '14:30', departure: null, distance: 1450 } // NDLS
    ]
  },
  {
    name: 'Rajdhani Express',
    trainNumber: '12954',
    source: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    destination: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    departureTime: new Date('2025-06-22T16:35:00'),
    arrivalTime: new Date('2025-06-23T08:45:00'),
    totalSeats: 500,
    availableSeats: 290,
    fare: 2750,
    trainType: 'Rajdhani',
    daysOfOperation: ['Tue', 'Thu', 'Sat'],
    route: [
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: null, departure: '16:35', distance: 0 }, // NDLS
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: '08:45', departure: null, distance: 1388 } // MMCT
    ]
  },
  {
    name: 'Duronto Express',
    trainNumber: '12262',
    source: '60d5ece658787c1b9c8d9a4f', // Ahmedabad
    destination: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    departureTime: new Date('2025-06-22T23:15:00'),
    arrivalTime: new Date('2025-06-23T06:30:00'),
    totalSeats: 600,
    availableSeats: 430,
    fare: 1650,
    trainType: 'Duronto',
    daysOfOperation: ['Mon', 'Wed', 'Fri', 'Sun'],
    route: [
      { station: '60d5ece658787c1b9c8d9a4f', arrival: null, departure: '23:15', distance: 0 }, // ADI
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: '06:30', departure: null, distance: 530 } // MMCT
    ]
  },
  {
    name: 'Garib Rath',
    trainNumber: '12904',
    source: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    destination: '60d5ecdd58787c1b9c8d9a4e', // Bengaluru City
    departureTime: new Date('2025-06-23T11:30:00'),
    arrivalTime: new Date('2025-06-24T15:45:00'),
    totalSeats: 1200,
    availableSeats: 950,
    fare: 2850,
    trainType: 'Express',
    daysOfOperation: ['Tue', 'Thu', 'Sat'],
    route: [
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: null, departure: '11:30', distance: 0 }, // NDLS
      { station: '60d5ecdd58787c1b9c8d9a4e', arrival: '15:45', departure: null, distance: 2150 } // SBC
    ]
  },
  {
    name: 'Vande Bharat Express',
    trainNumber: '20904',
    source: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    destination: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    departureTime: new Date('2025-06-23T06:00:00'),
    arrivalTime: new Date('2025-06-23T22:30:00'),
    totalSeats: 300,
    availableSeats: 125,
    fare: 3650,
    trainType: 'Shatabdi',
    daysOfOperation: ['Mon', 'Wed', 'Fri', 'Sun'],
    route: [
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: null, departure: '06:00', distance: 0 }, // NDLS
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: '22:30', departure: null, distance: 1388 } // MMCT
    ]
  },
  {
    name: 'Shatabdi Express',
    trainNumber: '12013',
    source: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    destination: '60d5ecd458787c1b9c8d9a4d', // Howrah
    departureTime: new Date('2025-06-23T06:00:00'),
    arrivalTime: new Date('2025-06-23T14:30:00'),
    totalSeats: 400,
    availableSeats: 210,
    fare: 2950,
    trainType: 'Shatabdi',
    daysOfOperation: ['Tue', 'Thu', 'Sat'],
    route: [
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: null, departure: '06:00', distance: 0 }, // NDLS
      { station: '60d5ecd458787c1b9c8d9a4d', arrival: '14:30', departure: null, distance: 1450 } // HWH
    ]
  },
  {
    name: 'Rajdhani Express',
    trainNumber: '12955',
    source: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    destination: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    departureTime: new Date('2025-06-23T16:35:00'),
    arrivalTime: new Date('2025-06-24T08:45:00'),
    totalSeats: 500,
    availableSeats: 330,
    fare: 2650,
    trainType: 'Rajdhani',
    daysOfOperation: ['Mon', 'Wed', 'Fri'],
    route: [
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: null, departure: '16:35', distance: 0 }, // MMCT
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: '08:45', departure: null, distance: 1388 } // NDLS
    ]
  },
  {
    name: 'SuperFast Express',
    trainNumber: '99999',
    source: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    destination: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    departureTime: new Date('2025-06-20T18:00:00'), // Departs LATER than Rajdhani
    arrivalTime: new Date('2025-06-21T08:00:00'),   // Arrives EARLIER than Rajdhani
    totalSeats: 200,
    availableSeats: 150,
    fare: 3000,
    trainType: 'Express',
    daysOfOperation: ['Mon', 'Wed', 'Fri'],
    route: [
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: null, departure: '18:00', distance: 0 }, // NDLS
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: '08:00', departure: null, distance: 1388 } // MMCT
    ]
  },
  {
    name: 'Duronto Express',
    trainNumber: '12263',
    source: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    destination: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    departureTime: new Date('2025-06-23T23:15:00'),
    arrivalTime: new Date('2025-06-24T11:30:00'),
    totalSeats: 600,
    availableSeats: 390,
    fare: 1850,
    trainType: 'Duronto',
    daysOfOperation: ['Tue', 'Thu', 'Sat'],
    route: [
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: null, departure: '23:15', distance: 0 }, // NDLS
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: '11:30', departure: null, distance: 1388 } // MMCT
    ]
  },
  {
    name: 'Garib Rath',
    trainNumber: '12905',
    source: '60d5eccb58787c1b9c8d9a4c', // Chennai Central
    destination: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    departureTime: new Date('2025-06-24T11:30:00'),
    arrivalTime: new Date('2025-06-25T15:45:00'),
    totalSeats: 1200,
    availableSeats: 910,
    fare: 3000,
    trainType: 'Express',
    daysOfOperation: ['Mon', 'Wed', 'Fri', 'Sun'],
    route: [
      { station: '60d5eccb58787c1b9c8d9a4c', arrival: null, departure: '11:30', distance: 0 }, // MAS
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: '15:45', departure: null, distance: 2180 } // NDLS
    ]
  },
  {
    name: 'Vande Bharat Express',
    trainNumber: '20905',
    source: '60d5ecb858787c1b9c8d9a4a', // Mumbai Central
    destination: '60d5ecc258787c1b9c8d9a4b', // New Delhi
    departureTime: new Date('2025-06-24T06:00:00'),
    arrivalTime: new Date('2025-06-24T22:30:00'),
    totalSeats: 300,
    availableSeats: 130,
    fare: 3750,
    trainType: 'Shatabdi',
    daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    route: [
      { station: '60d5ecb858787c1b9c8d9a4a', arrival: null, departure: '06:00', distance: 0 }, // MMCT
      { station: '60d5ecc258787c1b9c8d9a4b', arrival: '22:30', departure: null, distance: 1388 } // NDLS
    ]
  }
];

// Function to connect to MongoDB with retry logic
const connectWithRetry = async (uri, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Connecting to MongoDB (attempt ${i + 1}/${retries})...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Successfully connected to MongoDB');
      return true;
    } catch (err) {
      console.error(`Connection attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) throw err;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const seedDatabase = async () => {
  try {
    console.log('\n=== Starting Database Seeding ===');
    
    // Connect to MongoDB with retry
    await connectWithRetry(process.env.MONGODB_URI || 'mongodb://localhost:27017/railway_planner');
    
    // Set up event listeners for better error handling
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    // Check if we should clear existing data
    const forceSeed = process.argv.includes('--force');
    const clearData = process.argv.includes('--clear') || forceSeed;
    
    if (clearData) {
      console.log('\n=== Clearing Existing Data ===');
      const deleteResult = await Train.deleteMany({}).exec();
      console.log(`✅ Cleared ${deleteResult.deletedCount} existing trains`);
      
      // Verify deletion
      const countAfterDelete = await Train.countDocuments().exec();
      if (countAfterDelete > 0) {
        console.warn(`⚠️  Warning: Expected 0 trains after clear, but found ${countAfterDelete}`);
      }
    } else {
      console.log('\n=== Checking Existing Data ===');
      const existingCount = await Train.countDocuments().exec();
      console.log(`Found ${existingCount} existing trains in database`);
    }

    // Check if we should seed data
    const existingCount = await Train.countDocuments().exec();
    const shouldSeed = existingCount < 5 || forceSeed;
    
    if (shouldSeed) {
      console.log('\n=== Seeding Train Data ===');
      console.log(`Preparing to insert ${sampleTrains.length} trains...`);
      
      // Insert in batches to avoid overwhelming MongoDB
      const BATCH_SIZE = 10;
      let insertedCount = 0;
      
      for (let i = 0; i < sampleTrains.length; i += BATCH_SIZE) {
        const batch = sampleTrains.slice(i, i + BATCH_SIZE);
        console.log(`\nInserting batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(sampleTrains.length/BATCH_SIZE)} (${batch.length} trains)...`);
        
        try {
          const result = await Train.insertMany(batch, { ordered: false });
          insertedCount += result.length;
          console.log(`✅ Successfully inserted ${result.length} trains`);
        } catch (batchError) {
          console.error('Error inserting batch:', batchError.message);
          if (batchError.writeErrors) {
            console.error('Failed documents:', batchError.writeErrors.length);
            // Continue with next batch even if one fails
          }
        }
      }
      
      console.log(`\n✅ Successfully inserted ${insertedCount} out of ${sampleTrains.length} trains`);
    } else {
      console.log('\nℹ️  Skipping seed - database already has sufficient train data (use --force to override)');
    }

    // Verify final count
    const finalCount = await Train.countDocuments().exec();
    console.log('\n=== Final Database State ===');
    console.log(`Total trains in database: ${finalCount}`);
    
    if (finalCount > 0) {
      const sample = await Train.findOne().lean().exec();
      console.log('\nSample train document:');
      console.log(JSON.stringify({
        _id: sample._id,
        trainNumber: sample.trainNumber,
        name: sample.name,
        source: sample.source,
        destination: sample.destination,
        departureTime: sample.departureTime,
        arrivalTime: sample.arrivalTime,
        availableSeats: sample.availableSeats,
        fare: sample.fare
      }, null, 2));
    }
    
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:');
    console.error(error);
    
    // More detailed error information
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error:', error.codeName);
      console.error('Error message:', error.message);
    } else if (error.name === 'ValidationError') {
      console.error('Validation Error:', error.message);
      Object.entries(error.errors).forEach(([field, err]) => {
        console.error(`- ${field}: ${err.message}`);
      });
    }
    
    process.exit(1);
  } finally {
    // Close the connection when done
    if (mongoose.connection.readyState === 1) { // 1 = connected
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
};

seedDatabase();
