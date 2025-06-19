const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/railway_planner';

console.log('Testing MongoDB connection...');
console.log('Connection string:', MONGODB_URI ? '*** URI is set ***' : 'MONGODB_URI is not set!');

async function testConnection() {
  try {
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    // Try to connect
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.listDatabases();
    
    console.log('\nAvailable databases:');
    result.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Check railway_planner database
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\nCollections in railway_planner:');
    if (collections.length === 0) {
      console.log('No collections found');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    // Check trains collection
    const trainsCollection = db.collection('trains');
    const trainCount = await trainsCollection.countDocuments();
    console.log(`\nNumber of trains: ${trainCount}`);
    
    if (trainCount > 0) {
      console.log('\nSample train:');
      const sample = await trainsCollection.findOne({});
      console.log(JSON.stringify(sample, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Error:', error.codeName);
      console.error('Error message:', error.message);
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error('Could not connect to MongoDB server');
      console.error('Please check if MongoDB is running and the connection string is correct');
    }
    
    process.exit(1);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\nConnection closed.');
    }
  }
}

// Run the test
testConnection().catch(console.error);
