console.log('Starting server initialization...');

// Load environment variables first
require('dotenv').config();
console.log('Environment variables loaded');

// Add error handling at the very top
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
console.log('Required core modules');

// Initialize express app
const app = express();
console.log('Express app initialized');

// In Vercel serverless functions, __dirname is already defined
console.log('Middleware initialization starting...');

// Enable CORS with detailed logging - temporarily allowing all origins for debugging
console.log('CORS: Allowing all origins for debugging');

const corsOptions = {
  origin: '*', // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-auth-token'],
  exposedHeaders: ['Content-Range', 'X-Total-Count', 'X-Total', 'x-auth-token'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
console.log('CORS middleware configured');

// Handle preflight requests
app.options('*', cors(corsOptions));
console.log('Preflight requests handler configured');

app.use(express.json());
console.log('JSON parser middleware configured');

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});
console.log('Request logging middleware configured');

// Import routes with error handling
console.log('Importing routes...');
try {
  const authRoutes = require('./routes/auth');
  const stationRoutes = require('./routes/stations');
  const trainRoutes = require('./routes/trains');
  const bookingRoutes = require('./routes/bookings');
  const reviewRoutes = require('./routes/reviews');
  const reportRoutes = require('./routes/reports');
  
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/stations', stationRoutes);
  app.use('/api/trains', trainRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/reports', reportRoutes);
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
  });
  
  console.log('All routes configured successfully');
} catch (error) {
  console.error('Error setting up routes:', error);
  process.exit(1);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});
console.log('Error handling middleware configured');

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

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
    
    // Exit with error code in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Only start the server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5001;
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
}

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

console.log('Server initialization complete');

// Export the Express API for Vercel
module.exports = app;
