require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');
const trainRoutes = require('./routes/trains');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const reportRoutes = require('./routes/reports');

const app = express();
const path = require('path');

// In Vercel serverless functions, __dirname is already defined
// No need to redefine it
// Middleware
// Parse CORS_ORIGIN from environment variable
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [];

// Add development origins if in development
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000');
}

// Add any additional required origins
const requiredOrigins = [
  'https://railway-planner-frontend1.vercel.app',
  'https://railway-planner-frontend.vercel.app',
  'https://railway-planner-y1h5.vercel.app'
];

// Merge and deduplicate origins
const allAllowedOrigins = [...new Set([...allowedOrigins, ...requiredOrigins])];

// Configure CORS with proper options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allAllowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.startsWith(allowedOrigin.replace('https://', 'http://'))
    )) {
      return callback(null, true);
    }
    
    // For debugging CORS issues
    console.log('CORS blocked origin:', origin);
    console.log('Allowed origins:', allAllowedOrigins);
    
    const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Total-Count', 'X-Total'],
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Database connection
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Mask password in the connection string for logging
    const maskedUri = process.env.MONGODB_URI.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+@/, '$1********@');
    console.log('Connection string:', maskedUri);
    
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    // Create a new MongoDB client for debugging
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    // Test the connection
    console.log('Testing MongoDB connection...');
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('MongoDB connection test successful!');
    
    // Now connect with Mongoose
    console.log('Connecting with Mongoose...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      tls: true,
      tlsAllowInvalidCertificates: false,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Database Name:', conn.connection.name);

    // Check for replica set, which is required for transactions
    const topologyType = conn.connection.client.topology.type;
    console.log(`MongoDB Topology Type: ${topologyType}`);
    if (topologyType !== 'ReplicaSetWithPrimary' && topologyType !== 'Sharded') {
        console.warn('\n⚠️  WARNING: MongoDB is not running as a replica set.');
        console.warn('Transactions, which are used in the booking process, are not supported on standalone instances.');
        console.warn('This may cause booking creation to fail.');
        console.warn('To fix this, please run your MongoDB instance as a replica set.\n');
    }
    
    // Set up event listeners
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });
    
    // Close the initial test connection
    await client.close();
    
  } catch (error) {
    console.error('\n❌ MongoDB connection failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // More detailed error information
    if (error.syscall === 'getaddrinfo') {
      console.error('\n🔍 DNS resolution failed. This usually means:');
      console.error('1. No internet connection');
      console.error('2. DNS server issues');
      console.error('3. Network connectivity problems');
    }
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n🔍 MongoDB Server Selection Error. Possible causes:');
      console.error('1. IP not whitelisted (even if you think it is)');
      console.error('2. Network firewall blocking the connection');
      console.error('3. MongoDB Atlas cluster is not running');
      console.error('4. Network connectivity issues');
    }
    
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Check if you can access MongoDB Atlas dashboard in your browser');
    console.error('2. Try connecting using MongoDB Compass with the same connection string');
    console.error('3. Try using a different network (e.g., mobile hotspot)');
    console.error('4. Check if your ISP is blocking MongoDB connections');
    console.error('5. Try using a VPN to rule out network issues');
    
    console.error('\n🔗 MongoDB Atlas Network Access URL:');
    console.error('https://cloud.mongodb.com/v2#/security/network/accessList');
    
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Railway Planner API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Static file serving has been removed as we're using separate frontend and backend deployments

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});
// Start the server
const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', err);
  server.close(() => process.exit(1));
});
