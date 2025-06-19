const { MongoClient } = require('mongodb');
require('dotenv').config();

console.log('Starting MongoDB connection check...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '*** URI is set ***' : 'MONGODB_URI is not set!');

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not set in environment variables');
  process.exit(1);
}

async function listDatabases() {
  console.log('Attempting to connect to MongoDB...');
  
  const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  });
  
  try {
    console.log('Calling client.connect()...');
    await client.connect();
    console.log('Connected successfully to MongoDB');
    
    // List all databases
    console.log('\nListing databases...');
    const adminDb = client.db('admin');
    try {
      const result = await adminDb.admin().listDatabases();
      console.log('Available databases:');
      result.databases.forEach(db => {
        console.log(`- ${db.name}`);
      });
    } catch (dbErr) {
      console.log('Could not list all databases (this might be normal depending on permissions)');
    }
    
    // Check railway_planner database
    const dbName = 'railway_planner';
    console.log(`\nChecking database: ${dbName}`);
    
    const db = client.db(dbName);
    
    // List collections
    try {
      const collections = await db.listCollections().toArray();
      console.log('\nCollections:');
      if (collections.length === 0) {
        console.log('No collections found in this database.');
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
        console.log('\nSample train documents:');
        const sampleTrains = await trainsCollection.find().limit(2).toArray();
        console.log(JSON.stringify(sampleTrains, null, 2));
      }
      
    } catch (colErr) {
      console.error('Error accessing database/collections:', colErr);
    }
    
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    console.log('Closing connection...');
    await client.close();
    console.log('Connection closed.');
  }
}

// Run the function
listDatabases().catch(console.error);
