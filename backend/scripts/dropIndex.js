const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/railway_planner';

async function dropIndex() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        
        // List all indexes
        const indexes = await db.collection('bookings').indexes();
        console.log('Current indexes:');
        console.log(indexes.map(idx => idx.name).join('\n'));

        // Find and drop the problematic index
        const indexName = 'train_1_journeyDate_1_passengers.seatNumber_1_passengers.coach_1';
        if (indexes.some(idx => idx.name === indexName)) {
            console.log('\nDropping index:', indexName);
            await db.collection('bookings').dropIndex(indexName);
            console.log('Successfully dropped index:', indexName);
        } else {
            console.log('\nIndex not found, nothing to drop');
        }

        console.log('\nCurrent indexes after drop:');
        const newIndexes = await db.collection('bookings').indexes();
        console.log(newIndexes.map(idx => idx.name).join('\n'));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

dropIndex();
