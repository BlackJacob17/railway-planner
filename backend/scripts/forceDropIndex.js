const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/railway_planner';
const INDEX_NAME = 'train_1_journeyDate_1_passengers.seatNumber_1_passengers.coach_1';

async function dropIndex() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        const collection = db.collection('bookings');
        
        // List all indexes
        const indexes = await collection.listIndexes().toArray();
        console.log('Current indexes:');
        indexes.forEach(idx => console.log(`- ${idx.name} (${JSON.stringify(idx.key)})`));
        
        // Check if the index exists
        const indexExists = indexes.some(idx => idx.name === INDEX_NAME);
        
        if (indexExists) {
            console.log(`\nDropping index: ${INDEX_NAME}`);
            await collection.dropIndex(INDEX_NAME);
            console.log('Successfully dropped index');
            
            // Verify it's gone
            const newIndexes = await collection.listIndexes().toArray();
            console.log('\nIndexes after drop:');
            newIndexes.forEach(idx => console.log(`- ${idx.name}`));
        } else {
            console.log(`\nIndex ${INDEX_NAME} does not exist`);
            
            // Try to find similar indexes
            const similarIndexes = indexes.filter(idx => 
                idx.name.includes('train') || 
                idx.name.includes('journeyDate') ||
                idx.name.includes('passengers')
            );
            
            if (similarIndexes.length > 0) {
                console.log('\nFound similar indexes that might be causing issues:');
                similarIndexes.forEach(idx => console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`));
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('\nConnection closed');
        process.exit(0);
    }
}

dropIndex();
